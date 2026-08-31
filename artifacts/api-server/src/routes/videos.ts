import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, videosTable } from "@workspace/db";
import {
  CreateVideoBody,
  UpdateVideoBody,
  GetVideoParams,
  UpdateVideoParams,
  DeleteVideoParams,
  ListVideosQueryParams,
  GetVideoResponse,
  UpdateVideoResponse,
  ListVideosResponse,
  GetVideoStatsResponse,
  ListCategoriesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/videos", async (req, res): Promise<void> => {
  const query = ListVideosQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(videosTable).$dynamic();

  if (query.data.category && query.data.productionType) {
    dbQuery = dbQuery.where(
      sql`${videosTable.category} = ${query.data.category} AND ${videosTable.productionType} = ${query.data.productionType}`,
    );
  } else if (query.data.category) {
    dbQuery = dbQuery.where(eq(videosTable.category, query.data.category));
  } else if (query.data.productionType) {
    dbQuery = dbQuery.where(eq(videosTable.productionType, query.data.productionType));
  }

  if (query.data.featured !== undefined) {
    dbQuery = dbQuery.where(eq(videosTable.featured, query.data.featured));
  }

  const videos = await dbQuery.orderBy(desc(videosTable.createdAt));
  res.json(ListVideosResponse.parse(videos));
});

router.get("/videos/stats/summary", async (_req, res): Promise<void> => {
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(videosTable);

  const [featuredResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(videosTable)
    .where(eq(videosTable.featured, true));

  const categoryRows = await db
    .select({
      category: videosTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(videosTable)
    .groupBy(videosTable.category);

  const stats = {
    totalVideos: totalResult.count,
    totalCategories: categoryRows.length,
    featuredCount: featuredResult.count,
    categoryBreakdown: categoryRows,
  };

  res.json(GetVideoStatsResponse.parse(stats));
});

router.get("/videos/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .selectDistinct({ category: videosTable.category })
    .from(videosTable)
    .orderBy(videosTable.category);

  const categories = rows.map((r) => r.category);
  res.json(ListCategoriesResponse.parse(categories));
});

router.get("/videos/:id", async (req, res): Promise<void> => {
  const params = GetVideoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [video] = await db
    .select()
    .from(videosTable)
    .where(eq(videosTable.id, params.data.id));

  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  res.json(GetVideoResponse.parse(video));
});

router.post("/videos", async (req, res): Promise<void> => {
  const parsed = CreateVideoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [video] = await db.insert(videosTable).values(parsed.data).returning();
  res.status(201).json(GetVideoResponse.parse(video));
});

router.patch("/videos/:id", async (req, res): Promise<void> => {
  const params = UpdateVideoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateVideoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [video] = await db
    .update(videosTable)
    .set(parsed.data)
    .where(eq(videosTable.id, params.data.id))
    .returning();

  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  res.json(UpdateVideoResponse.parse(video));
});

router.delete("/videos/:id", async (req, res): Promise<void> => {
  const params = DeleteVideoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [video] = await db
    .delete(videosTable)
    .where(eq(videosTable.id, params.data.id))
    .returning();

  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
