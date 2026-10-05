// Create .dev.vars from .dev.vars.example on first `pnpm dev`, adding a
// generated BETTER_AUTH_SECRET. Leaves an existing .dev.vars untouched.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

if (!existsSync(".dev.vars")) {
  let vars = readFileSync(".dev.vars.example", "utf8");
  if (!/^BETTER_AUTH_SECRET=./mu.test(vars)) {
    vars += `\nBETTER_AUTH_SECRET=${randomBytes(32).toString("base64")}\n`;
  }
  writeFileSync(".dev.vars", vars);
  console.log("Created .dev.vars with a generated BETTER_AUTH_SECRET.");
}
