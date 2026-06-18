import { Router, type IRouter } from "express";
import { db, contactSubmissionsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

const INQUIRY_OPTIONS = ["Creative Studio", "Business Architects", "General"] as const;

router.post("/contact", async (req, res): Promise<void> => {
  const { name, email, inquiry, message } = req.body as {
    name?: string;
    email?: string;
    inquiry?: string;
    message?: string;
  };

  if (!name || !email || !message || !INQUIRY_OPTIONS.includes(inquiry as typeof INQUIRY_OPTIONS[number])) {
    res.status(400).json({ error: "Invalid submission" });
    return;
  }

  const [submission] = await db
    .insert(contactSubmissionsTable)
    .values({ name, email, inquiry, message })
    .returning();

  req.log.info({ id: submission.id, name, email, inquiry }, "Contact form submission saved");
  res.json({ ok: true });
});

router.get("/contact/submissions", async (req, res): Promise<void> => {
  const submissions = await db
    .select()
    .from(contactSubmissionsTable)
    .orderBy(desc(contactSubmissionsTable.createdAt));
  res.json(submissions);
});

export default router;
