import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const videosTable = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoPath: text("video_path").notNull(),
  thumbnailPath: text("thumbnail_path"),
  category: text("category").notNull(),
  featured: boolean("featured").notNull().default(false),
  duration: text("duration"),
  year: integer("year"),
  director: text("director"),
  format: text("format"),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videosTable).omit({ id: true, createdAt: true });
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videosTable.$inferSelect;
