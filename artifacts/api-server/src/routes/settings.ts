import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/settings", async (req, res): Promise<void> => {
  const rows = await db.select().from(settingsTable);
  const result: Record<string, string> = {};
  for (const row of rows) result[row.key] = row.value;
  res.json(result);
});

router.put("/settings/:key", async (req, res): Promise<void> => {
  const { key } = req.params;
  const { value } = req.body as { value?: string };
  if (!value) {
    res.status(400).json({ error: "value is required" });
    return;
  }
  const [row] = await db
    .insert(settingsTable)
    .values({ key, value })
    .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date() } })
    .returning();
  res.json(row);
});

export default router;
