import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studioImagesTable = pgTable("studio_images", {
  id: serial("id").primaryKey(),
  imagePath: text("image_path").notNull(),
  category: text("category").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStudioImageSchema = createInsertSchema(studioImagesTable).omit({ id: true, createdAt: true });
export type InsertStudioImage = z.infer<typeof insertStudioImageSchema>;
export type StudioImage = typeof studioImagesTable.$inferSelect;
