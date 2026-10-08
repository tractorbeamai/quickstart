import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";

// Only send what the UI needs: the session is serialized into the page, and
// the session token must stay in its httpOnly cookie.
export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const result = await auth.api.getSession({ headers: getRequestHeaders() });
  if (!result) {
    return null;
  }
  return { user: result.user, expiresAt: result.session.expiresAt };
});

// The root route reads the session through this query, so client navigation
// reuses it instead of calling the server each time. Matches the Better Auth
// cookie cache window; useSessionChange clears it on sign-in and sign-out.
export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: () => getSession(),
  staleTime: 5 * 60 * 1000,
});
