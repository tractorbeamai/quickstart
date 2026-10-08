import { createFileRoute, redirect } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { useSignOut } from "@/hooks/use-session-change";

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
  const handleSignOut = useSignOut();

  return (
    <Card className="w-full self-center sm:max-w-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <UserAvatar className="size-12" user={user} />
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
  );
}
