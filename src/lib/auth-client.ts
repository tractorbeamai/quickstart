import { createAuthClient } from "better-auth/react";

// Same-origin: the client talks to the /api/auth/$ route on this Worker.
export const authClient = createAuthClient();
