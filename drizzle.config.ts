import { defineConfig } from "drizzle-kit";

// Drizzle Kit only generates SQL here. Wrangler applies it to D1 with
// `pnpm db:migrate` (local) and `pnpm db:migrate:remote` (deployed).
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./migrations",
});
