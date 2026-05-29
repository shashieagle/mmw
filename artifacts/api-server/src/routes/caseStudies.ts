import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, caseStudiesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/case-studies", async (req, res): Promise<void> => {
  const items = await db
    .select()
    .from(caseStudiesTable)
    .orderBy(asc(caseStudiesTable.sortOrder), asc(caseStudiesTable.createdAt));
  res.json(items);
});

router.post("/case-studies", async (req, res): Promise<void> => {
  const { slug, tag, client, headline, result, detail, gradient, stats, sortOrder } = req.body as {
    slug?: string;
    tag?: string;
    client?: string;
    headline?: string;
    result?: string;
    detail?: string;
    gradient?: string;
    stats?: { value: string; label: string }[];
    sortOrder?: number;
  };

  if (!slug || !tag || !client || !headline || !result || !detail) {
    res.status(400).json({ error: "slug, tag, client, headline, result, and detail are required" });
    return;
  }

  const [item] = await db
    .insert(caseStudiesTable)
    .values({
      slug,
      tag,
      client,
      headline,
      result,
      detail,
      gradient: gradient ?? "from-zinc-900/40 via-zinc-950 to-black",
      stats: stats ?? [],
      sortOrder: sortOrder ?? 0,
    })
    .returning();

  res.status(201).json(item);
});

router.put("/case-studies/:id", async (req, res): Promise<void> => {
  const numId = parseInt(req.params.id || "", 10);
  if (isNaN(numId)) {
    res.status(400).json({ error: "valid id is required" });
    return;
  }

  const { slug, tag, client, headline, result, detail, gradient, stats, sortOrder } = req.body as {
    slug?: string;
    tag?: string;
    client?: string;
    headline?: string;
    result?: string;
    detail?: string;
    gradient?: string;
    stats?: { value: string; label: string }[];
    sortOrder?: number;
  };

  if (!slug || !tag || !client || !headline || !result || !detail) {
    res.status(400).json({ error: "slug, tag, client, headline, result, and detail are required" });
    return;
  }

  const [updated] = await db
    .update(caseStudiesTable)
    .set({ slug, tag, client, headline, result, detail, gradient, stats, sortOrder })
    .where(eq(caseStudiesTable.id, numId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Case study not found" });
    return;
  }

  res.json(updated);
});

router.delete("/case-studies/:id", async (req, res): Promise<void> => {
  const numId = parseInt(req.params.id || "", 10);
  if (isNaN(numId)) {
    res.status(400).json({ error: "valid id is required" });
    return;
  }

  const [deleted] = await db
    .delete(caseStudiesTable)
    .where(eq(caseStudiesTable.id, numId))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Case study not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
