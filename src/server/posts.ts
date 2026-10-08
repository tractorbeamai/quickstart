import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { PostId, postIdSchema, posts, type Post } from "@/db/schema";

// The list only shows these columns, so don't ship post bodies to the page.
export const listPosts = createServerFn({ method: "GET" }).handler(async () => {
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      createdAt: posts.createdAt,
    })
    .from(posts);
});

export const findPostById = createServerFn({ method: "GET" })
  .validator(postIdSchema)
  .handler(async ({ data: { id } }): Promise<Post | null> => {
    const result = await db.select().from(posts).where(eq(posts.id, id));
    return result[0] ?? null;
  });

export const listPostsQueryOptions = () =>
  queryOptions({
    queryKey: ["posts"],
    queryFn: () => listPosts(),
  });

export const findPostByIdQueryOptions = ({ id }: PostId) =>
  queryOptions({
    queryKey: ["posts", id],
    queryFn: () => findPostById({ data: { id } }),
  });
