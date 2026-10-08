import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { findPostByIdQueryOptions } from "@/server/posts";

export const Route = createFileRoute("/_app/example/posts/$postId")({
  loader: async ({ params: { postId }, context }) => {
    await context.queryClient.query({
      ...findPostByIdQueryOptions({ id: Number(postId) }),
      staleTime: "static",
    });
  },
  component: PostDetail,
});

function PostDetail() {
  const { postId } = Route.useParams();
  const { data: post } = useSuspenseQuery(findPostByIdQueryOptions({ id: +postId }));

  if (!post) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Post Not Found</CardTitle>
          <CardDescription>The post you're looking for doesn't exist.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link to="/example/posts" />}>Back to Posts</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Button variant="ghost" render={<Link to="/example/posts" />}>
          &larr; Back to Posts
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-3xl">{post.title}</CardTitle>
              <CardDescription>
                Created on{" "}
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </div>
            <Badge variant={post.status === "published" ? "default" : "secondary"}>
              {post.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Content</h3>
            <p className="whitespace-pre-wrap text-foreground">{post.content}</p>
          </div>

          <div className="flex items-center gap-4 border-t pt-6 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(post.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Updated:</span>{" "}
              {new Date(post.updatedAt).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
