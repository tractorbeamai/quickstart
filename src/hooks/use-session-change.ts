import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { sessionQueryOptions } from "@/server/auth";

// Call after signing in or out: drops the cached session and navigates, which
// re-runs the root beforeLoad and loads the new session once.
export function useSessionChange() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useCallback(
    async (to: string) => {
      queryClient.removeQueries({ queryKey: sessionQueryOptions.queryKey });
      await navigate({ to });
    },
    [navigate, queryClient],
  );
}

export function useSignOut() {
  const sessionChange = useSessionChange();

  return useCallback(async () => {
    await authClient.signOut();
    await sessionChange("/login");
  }, [sessionChange]);
}
