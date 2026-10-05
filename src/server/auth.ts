import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";

// Loaded once in the root route's beforeLoad, so it runs during SSR and on
// client navigation. Only send what the UI needs: route context is serialized
// into the page, and the session token must stay in its httpOnly cookie.
export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const result = await auth.api.getSession({ headers: getRequestHeaders() });
  if (!result) {
    return null;
  }
  return { user: result.user, expiresAt: result.session.expiresAt };
});
