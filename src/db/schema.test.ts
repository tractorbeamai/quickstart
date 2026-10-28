import { describe, expect, it } from "vite-plus/test";

import { db } from "@/db/client";
import { posts } from "@/db/schema";

// D1 is SQLite: check that the column modes round-trip the types the app uses.
describe("schema on D1", () => {
  it("defaults post status, id, and timestamps", async () => {
    const [post] = await db.insert(posts).values({ title: "Hello", content: "World" }).returning();

    expect(post?.id).toBeTypeOf("number");
    expect(post?.status).toBe("draft");
    expect(post?.createdAt).toBeInstanceOf(Date);
  });
});
