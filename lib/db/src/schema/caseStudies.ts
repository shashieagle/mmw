import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const caseStudiesTable = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  tag: text("tag").notNull(),
  client: text("client").notNull(),
  headline: text("headline").notNull(),
  result: text("result").notNull(),
  detail: text("detail").notNull(),
  gradient: text("gradient").notNull().default("from-zinc-900/40 via-zinc-950 to-black"),
  stats: jsonb("stats").notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCaseStudySchema = createInsertSchema(caseStudiesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;
export type CaseStudy = typeof caseStudiesTable.$inferSelect;
