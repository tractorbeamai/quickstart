import { drizzle } from "drizzle-orm/d1";
import { getPlatformProxy } from "wrangler";

import { posts, type InsertPost } from "./schema";

// Runs in Node, outside the Worker, so it borrows the local D1 binding from
// Wrangler instead of `cloudflare:workers`. Seeds the same .wrangler/ database
// that `pnpm dev` uses.
const proxy = await getPlatformProxy<Env>();
const db = drizzle(proxy.env.DB);

const examplePosts: InsertPost[] = [
  {
    title: "Welcome to the quickstart",
    content: "This post was inserted by `pnpm db:seed` into your local D1 database.",
    status: "published",
  },
  {
    title: "Server functions on Workers",
    content: "Posts are read through a TanStack Start server function backed by Drizzle and D1.",
    status: "published",
  },
  {
    title: "A draft idea",
    content: "Drafts show up too. Edit src/db/seed.ts to change the starting data.",
    status: "draft",
  },
];

try {
  // eslint-disable-next-line drizzle/enforce-delete-with-where -- clearing the table for a fresh seed
  await db.batch([db.delete(posts), db.insert(posts).values(examplePosts)]);
  console.log(`Seeded ${examplePosts.length} posts.`);
} catch (error) {
  console.error("Seeding failed:", error);
  process.exitCode = 1;
} finally {
  await proxy.dispose();
}
