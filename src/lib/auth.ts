import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { env } from "@/lib/env-server";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  emailAndPassword: {
    enabled: true,
  },
  // The root route checks the session on every navigation; a signed cookie
  // answers that without a D1 read for up to five minutes.
  session: {
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  // Must stay last so cookies set by other plugins reach TanStack Start.
  plugins: [tanstackStartCookies()],
});
