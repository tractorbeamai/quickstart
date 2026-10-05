import { env as workerEnv } from "cloudflare:workers";
import { z } from "zod";

// Secrets come from .dev.vars locally and `wrangler secret put` in production.
// Bindings such as DB are typed by worker-configuration.d.ts instead.
export const envServerSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url().optional(),
  ANTHROPIC_API_KEY: z.string().trim().min(1).optional(),
});

const result = envServerSchema.safeParse(workerEnv);

if (!result.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(z.treeifyError(result.error), null, 2));
  throw new Error("Invalid environment variables");
}

export const env = result.data;
