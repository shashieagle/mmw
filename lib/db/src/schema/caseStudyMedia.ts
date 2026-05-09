import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const caseStudyMediaTable = pgTable("case_study_media", {
  id: serial("id").primaryKey(),
  caseStudySlug: text("case_study_slug").notNull(),
  mediaPath: text("media_path").notNull(),
  mediaType: text("media_type").notNull().default("image"),
  caption: text("caption"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCaseStudyMediaSchema = createInsertSchema(caseStudyMediaTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCaseStudyMedia = z.infer<typeof insertCaseStudyMediaSchema>;
export type CaseStudyMedia = typeof caseStudyMediaTable.$inferSelect;
