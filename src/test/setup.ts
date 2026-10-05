import { applyD1Migrations, type D1Migration } from "cloudflare:test";
import { env } from "cloudflare:workers";

// TEST_MIGRATIONS is a test-only binding (see `test.projects` in
// vite.config.ts), so it is typed here rather than on the app's Env.
const testEnv = env as Cloudflare.Env & { TEST_MIGRATIONS: D1Migration[] };

// Each test file gets isolated storage, so apply the real migrations to its D1.
await applyD1Migrations(testEnv.DB, testEnv.TEST_MIGRATIONS);
