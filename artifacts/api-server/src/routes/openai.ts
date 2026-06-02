import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const MONK_SYSTEM_PROMPT = `You are Monk, the voice of Monk Monkey Works (MMW). You are sharp, warm, and direct — never robotic, never verbose.

CRITICAL RULES:
- Always answer with a 1-line intro, then 2–4 bullet points (use • as bullet character). Max 8 words per bullet.
- No paragraphs. No walls of text. Bullets only after the intro line.
- Be sharp and confident. Say the most with the least.
- Never mention pricing or costs. If asked, say every engagement is structured around the specific project and starts with a discovery call.
- If someone asks something off-topic, warmly redirect: "I'm best at answering questions about MMW — what would you like to know?"

FORMAT EXAMPLE:
Here's what MMW does:
• Strategy + storytelling for founders
• AI-powered films and branded content
• Systems that help businesses scale faster
• Everything built around your specific narrative

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

  // Generate contextual follow-up questions that nudge toward a discovery call
  try {
    const suggestionResponse = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 200,
      messages: [
        {
          role: "system",
          content: `You generate follow-up questions for a visitor on the Monk Monkey Works website. 
Based on the conversation, create exactly 3 short follow-up questions that:
1. Feel natural and relevant to what was just discussed
2. Progressively guide the visitor toward wanting to work with MMW or book a discovery call
3. Are phrased from the visitor's perspective (e.g. "How would MMW help my business?")
4. Are concise — max 10 words each

Return ONLY a JSON array of 3 strings. No explanation, no markdown.
Example: ["How does this work for small businesses?", "What happens in a discovery call?", "Can MMW help with our branding?"]`,
        },
        {
          role: "user",
          content: `Last question asked: "${userContent}"\nMonk's answer: "${fullResponse}"\n\nGenerate 3 follow-up questions.`,
        },
      ],
    });

    const raw = suggestionResponse.choices[0]?.message?.content ?? "[]";
    const suggestions = JSON.parse(raw.trim());
    res.write(`data: ${JSON.stringify({ suggestions })}\n\n`);
  } catch {
    // silently skip suggestions if generation fails
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
