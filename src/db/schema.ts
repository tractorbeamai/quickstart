import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

// Better Auth tables (user, session, account, verification). Regenerate with
// `pnpm auth:generate` after changing auth plugins.
export * from "./auth-schema";

// D1 is SQLite: store timestamps as epoch milliseconds, matching Better Auth.
const timestamp = (name: string) =>
  integer(name, { mode: "timestamp_ms" }).default(
    sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
  );

const uuid = (name: string) =>
  text(name)
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

// Example posts table with drizzle-zod integration
export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Zod schemas generated from Drizzle schema
export const postIdSchema = z.object({
  id: z.int().positive(),
});
export const selectPostSchema = createSelectSchema(posts);
export const insertPostSchema = createInsertSchema(posts);
export const updatePostSchema = createUpdateSchema(posts).extend(postIdSchema.shape);

// Types inferred from schemas
export type PostId = z.infer<typeof postIdSchema>;
export type Post = z.infer<typeof selectPostSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;

// ============================================================================
// TAUREAN TALENT NETWORK TABLES
// ============================================================================

// Candidate status options
export const candidateStatusEnum = [
  "new",
  "reviewing",
  "qualified",
  "contacted",
  "rejected",
  "placed",
] as const;

// Pipeline stage options
export const pipelineStageEnum = [
  "new_submissions",
  "under_review",
  "qualified",
  "outreach_sent",
  "in_conversation",
  "placed",
] as const;

// AI Analysis structure
export const aiAnalysisSchema = z.object({
  peExposure: z.number().min(0).max(10),
  seniority: z.number().min(0).max(10),
  functionalDepth: z.number().min(0).max(10),
  cultureSignals: z.number().min(0).max(10),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  reasons: z.array(z.string()),
});

export type AIAnalysis = z.infer<typeof aiAnalysisSchema>;

// Candidates table
export const candidates = sqliteTable("candidates", {
  id: uuid("id"),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  resumeText: text("resume_text"),
  resumeFileName: text("resume_file_name"),
  aiScore: integer("ai_score"),
  aiAnalysis: text("ai_analysis", { mode: "json" }).$type<AIAnalysis>(),
  qualified: integer("qualified", { mode: "boolean" }),
  status: text("status", { enum: candidateStatusEnum }).default("new"),
  pipelineStage: text("pipeline_stage", { enum: pipelineStageEnum }).default("new_submissions"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Intake responses table
export const intakeResponses = sqliteTable("intake_responses", {
  id: uuid("id"),
  candidateId: text("candidate_id")
    .references(() => candidates.id, { onDelete: "cascade" })
    .notNull(),
  questionKey: text("question_key").notNull(),
  questionText: text("question_text").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at"),
});

// Zod schemas for candidates
export const candidateIdSchema = z.object({
  id: z.uuid(),
});
export const selectCandidateSchema = createSelectSchema(candidates);
export const insertCandidateSchema = createInsertSchema(candidates);
export const updateCandidateSchema = createUpdateSchema(candidates).extend(candidateIdSchema.shape);

// Types for candidates
export type CandidateId = z.infer<typeof candidateIdSchema>;
export type Candidate = z.infer<typeof selectCandidateSchema>;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type UpdateCandidate = z.infer<typeof updateCandidateSchema>;

// Zod schemas for intake responses
export const intakeResponseIdSchema = z.object({
  id: z.uuid(),
});
export const selectIntakeResponseSchema = createSelectSchema(intakeResponses);
export const insertIntakeResponseSchema = createInsertSchema(intakeResponses);

// Types for intake responses
export type IntakeResponseId = z.infer<typeof intakeResponseIdSchema>;
export type IntakeResponse = z.infer<typeof selectIntakeResponseSchema>;
export type InsertIntakeResponse = z.infer<typeof insertIntakeResponseSchema>;

// Status and pipeline stage types
export type CandidateStatus = (typeof candidateStatusEnum)[number];
export type PipelineStage = (typeof pipelineStageEnum)[number];
