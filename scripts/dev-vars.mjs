// Create .dev.vars from .dev.vars.example on first `pnpm dev`, with a freshly
// generated BETTER_AUTH_SECRET. Leaves an existing .dev.vars untouched.
import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

if (!existsSync(".dev.vars")) {
  copyFileSync(".dev.vars.example", ".dev.vars");
  const secret = randomBytes(32).toString("base64");
  const vars = readFileSync(".dev.vars", "utf8").replace(
    /^# BETTER_AUTH_SECRET=.*$/mu,
    `BETTER_AUTH_SECRET=${secret}`,
  );
  writeFileSync(".dev.vars", vars);
  console.log("Created .dev.vars with a generated BETTER_AUTH_SECRET.");
}
