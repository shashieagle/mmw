import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, caseStudyMediaTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/case-studies/:slug/media", async (req, res): Promise<void> => {
  const { slug } = req.params;
  if (!slug) {
    res.status(400).json({ error: "slug is required" });
    return;
  }

  const items = await db
    .select()
    .from(caseStudyMediaTable)
    .where(eq(caseStudyMediaTable.caseStudySlug, slug))
    .orderBy(caseStudyMediaTable.createdAt);

  res.json(items);
});

router.post("/case-studies/:slug/media", async (req, res): Promise<void> => {
  const { slug } = req.params;
  if (!slug) {
    res.status(400).json({ error: "slug is required" });
    return;
  }

  const { mediaPath, mediaType, caption } = req.body as {
    mediaPath?: string;
    mediaType?: string;
    caption?: string;
  };

  if (!mediaPath) {
    res.status(400).json({ error: "mediaPath is required" });
    return;
  }

  const validType = mediaType === "video" ? "video" : "image";

  const [item] = await db
    .insert(caseStudyMediaTable)
    .values({
      caseStudySlug: slug,
      mediaPath,
      mediaType: validType,
      caption: caption ?? null,
    })
    .returning();

  res.status(201).json(item);
});

router.delete("/case-studies/:slug/media/:id", async (req, res): Promise<void> => {
  const { slug, id } = req.params;
  const numId = parseInt(id || "", 10);

  if (!slug || isNaN(numId)) {
    res.status(400).json({ error: "valid slug and id are required" });
    return;
  }

  const [deleted] = await db
    .delete(caseStudyMediaTable)
    .where(
      and(
        eq(caseStudyMediaTable.caseStudySlug, slug),
        eq(caseStudyMediaTable.id, numId)
      )
    )
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Media not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
