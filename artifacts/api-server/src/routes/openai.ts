import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const MONK_SYSTEM_PROMPT = `You are Monk, the voice of Monk Monkey Works (MMW). You are sharp, warm, and direct — never robotic, never verbose.

CRITICAL RULES:
- Answer in 2–4 sentences MAX. No exceptions. No bullet lists. No headers. No paragraphs.
- Be elegant and confident. Say the most with the least.
- Never mention pricing or costs. Say every engagement is structured around the specific project and starts with a discovery call.
- If someone asks something off-topic, warmly redirect: "I'm best at answering questions about MMW — what would you like to know?"

About MMW:
Monk Monkey Works helps founders and businesses become more trusted, more memorable, and more valuable — by aligning strategy, storytelling, culture, design, media, and AI into one clear narrative. Two arms: the Creative Studio (AI films, photography, branded content) and Business Architects (strategy, systems, and AI adoption for scaling businesses).

Creative Ecosystem Certification™: MMW's framework that measures the real cultural and human impact of creative work — tracking human employment, artists supported, ethical AI use, community contribution, and storytelling investment.

Catalyst: An invite-only 50-seat core team of creatives and business minds. Not employees — partners. Built to work from the inside.

How to work together: Everything starts with a discovery call. Every engagement is shaped around the specific business.`;

// Create a new conversation (called automatically when chat widget opens)
router.post("/openai/conversations", async (req, res) => {
  const title = req.body?.title ?? "Chat with Monk";
  const [conv] = await db.insert(conversations).values({ title }).returning();
  res.status(201).json(conv);
});

// List conversations (for admin view)
router.get("/openai/conversations", async (req, res) => {
  const all = await db.select().from(conversations).orderBy(conversations.createdAt);
  res.json(all);
});

// Get conversation with messages
router.get("/openai/conversations/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) { res.status(404).json({ error: "Not found" }); return; }
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  res.json({ ...conv, messages: msgs });
});

// Delete conversation
router.delete("/openai/conversations/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(messages).where(eq(messages.conversationId, id));
  const deleted = await db.delete(conversations).where(eq(conversations.id, id)).returning();
  if (!deleted.length) { res.status(404).json({ error: "Not found" }); return; }
  res.status(204).end();
});

// Send a message and stream back Monk's response
router.post("/openai/conversations/:id/messages", async (req, res) => {
  const id = Number(req.params["id"]);
  const userContent: string = req.body?.content ?? "";

  if (!userContent.trim()) {
    res.status(400).json({ error: "Message content is required" });
    return;
  }

  // Save user message
  await db.insert(messages).values({ conversationId: id, role: "user", content: userContent });

  // Load conversation history
  const history = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);

  const chatMessages = [
    { role: "system" as const, content: MONK_SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  const stream = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 8192,
    messages: chatMessages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      fullResponse += content;
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  // Save assistant response
  await db.insert(messages).values({ conversationId: id, role: "assistant", content: fullResponse });

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
