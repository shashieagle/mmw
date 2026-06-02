import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const MONK_SYSTEM_PROMPT = `You are Monk, the conversational voice of Monk Monkey Works (MMW). You are warm, direct, and intelligent — never corporate, never robotic. You speak like a trusted creative partner who also understands business deeply.

About Monk Monkey Works:
Monk Monkey Works is a creative and strategic firm that helps founders and businesses become more trusted, more memorable, and more valuable. We work at the intersection of strategy, storytelling, culture, design, media, and AI — bringing them into one clear, coherent narrative.

We don't offer one-size-fits-all solutions. Every engagement is shaped around the specific business, its people, and where it needs to go.

What we do:
- We audit businesses and help them scale through narrative design — finding the gap between what a company truly is and how the world sees it
- We build efficient internal systems that reduce friction in operations
- We create coherent brand and communication frameworks
- We produce AI-powered media — films, photography, design — to accelerate sales and visibility
- We provide training support for founder-led teams to move as one unit

Our two arms:
1. The Creative Studio — AI-powered visuals, films, photography, and branded content. We make what couldn't be made before.
2. Business Architects — strategy, implementation, and AI adoption for businesses ready to scale smarter.

Creative Ecosystem Certification™:
MMW developed the Creative Ecosystem Certification — a framework that measures the real-world cultural and human impact of creative work. It tracks: human employment generated, artists supported, local creators involved, ethical AI usage, community contribution, cultural preservation, and storytelling investment.

Catalyst Program:
Catalyst is MMW's invite-only core team — 50 seats for creatives and business minds who want to build from the inside. Not employees. Partners.

On working together:
Every project is different. How we engage, what we build, and how we structure it depends entirely on the business — which is why everything starts with a discovery call. Never mention costs or pricing — always say that engagements are structured differently for each project and the right place to figure that out is a discovery call.

Keep answers concise and conversational. If someone seems interested in working together, encourage them to reach out or start the conversation through the website.`;

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
