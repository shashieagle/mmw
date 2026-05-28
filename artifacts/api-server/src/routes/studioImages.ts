import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, studioImagesTable } from "@workspace/db";
import {
  ListStudioImagesQueryParams,
  ListStudioImagesResponse,
  ListStudioImagesResponseItem,
  CreateStudioImageBody,
  DeleteStudioImageParams,
  ListImageCategoriesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/images", async (req, res): Promise<void> => {
  const query = ListStudioImagesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(studioImagesTable).$dynamic();
  if (query.data.category) {
    dbQuery = dbQuery.where(eq(studioImagesTable.category, query.data.category));
  }

  const images = await dbQuery.orderBy(studioImagesTable.createdAt);
  res.json(ListStudioImagesResponse.parse(images));
});

router.get("/images/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .selectDistinct({ category: studioImagesTable.category })
    .from(studioImagesTable)
    .orderBy(studioImagesTable.category);
  res.json(ListImageCategoriesResponse.parse(rows.map((r) => r.category)));
});

router.post("/images", async (req, res): Promise<void> => {
  const parsed = CreateStudioImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [image] = await db.insert(studioImagesTable).values(parsed.data).returning();
  res.status(201).json(ListStudioImagesResponseItem.parse(image));
});

router.delete("/images/:id", async (req, res): Promise<void> => {
  const params = DeleteStudioImageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [image] = await db
    .delete(studioImagesTable)
    .where(eq(studioImagesTable.id, params.data.id))
    .returning();
  if (!image) {
    res.status(404).json({ error: "Image not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
