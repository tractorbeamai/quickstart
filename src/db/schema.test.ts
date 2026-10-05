import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { db } from "@/db/client";
import { candidates, posts } from "@/db/schema";

// D1 is SQLite: check that the column modes round-trip the types the app uses.
describe("schema on D1", () => {
  it("defaults post status, id, and timestamps", async () => {
    const [post] = await db.insert(posts).values({ title: "Hello", content: "World" }).returning();

    expect(post?.id).toBeTypeOf("number");
    expect(post?.status).toBe("draft");
    expect(post?.createdAt).toBeInstanceOf(Date);
  });

  it("round-trips candidate uuid, boolean, and JSON columns", async () => {
    const analysis = {
      peExposure: 8,
      seniority: 7,
      functionalDepth: 9,
      cultureSignals: 6,
      strengths: ["Operator"],
      concerns: [],
      reasons: ["PE-backed CFO"],
    };
    const [inserted] = await db
      .insert(candidates)
      .values({ email: "cfo@example.com", qualified: true, aiAnalysis: analysis })
      .returning();
    expect(inserted?.id).toMatch(/^[0-9a-f-]{36}$/u);

    const [row] = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, inserted?.id ?? ""));
    expect(row?.qualified).toBe(true);
    expect(row?.aiAnalysis).toEqual(analysis);
    expect(row?.pipelineStage).toBe("new_submissions");
  });
});
