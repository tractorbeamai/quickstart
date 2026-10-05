import { useCallback } from "react";
import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

// Protected route: the root route loads the session, and this beforeLoad
// narrows it, so signed-out visitors are redirected before the page renders.
export const Route = createFileRoute("/_app/example/account")({
  beforeLoad: ({ context: { session }, location }) => {
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { session };
  },
  component: AccountPage,
});

function AccountPage() {
  const { session } = Route.useRouteContext();
  const { user } = session;
  const navigate = useNavigate();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    await router.invalidate();
    await navigate({ to: "/login" });
  }, [navigate, router]);

  return (
    <main className="mx-auto flex w-full max-w-5xl justify-center px-6 py-24">
      <Card className="w-full sm:max-w-md">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="size-12">
            {user.image ? <AvatarImage alt={user.name} src={user.image} /> : null}
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member since</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Session expires</span>
            <span>{new Date(session.expiresAt).toLocaleString()}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSignOut} variant="outline">
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
