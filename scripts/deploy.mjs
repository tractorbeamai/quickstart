// Build, migrate D1, and deploy the Worker (or a Preview with --preview).
// Generates BETTER_AUTH_SECRET if the target doesn't have one yet, and never
// replaces an existing one, so redeploys don't sign everyone out.
// Usage: node scripts/deploy.mjs [--preview]
import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const preview = process.argv.includes("--preview");
const run = (args) => execFileSync("pnpm", args, { stdio: "inherit" });

// Workers Builds runs the build command before this deploy command.
if (!process.env.WORKERS_CI) {
  run(["build"]);
}
run([preview ? "db:migrate:preview" : "db:migrate:remote"]);

// Listing fails before a Worker or Preview's first deploy; treat that as missing.
const listing = spawnSync(
  "pnpm",
  ["exec", "wrangler", ...(preview ? ["preview", "secret", "list", "--json"] : ["secret", "list"])],
  { encoding: "utf8" },
);
const hasSecret = listing.status === 0 && listing.stdout.includes('"BETTER_AUTH_SECRET"');

const deploy = ["exec", "wrangler", preview ? "preview" : "deploy"];
const secretsFile = join(tmpdir(), `quickstart-secrets-${process.pid}.json`);
if (!hasSecret) {
  const secret = randomBytes(32).toString("base64");
  writeFileSync(secretsFile, JSON.stringify({ BETTER_AUTH_SECRET: secret }), { mode: 0o600 });
  deploy.push("--secrets-file", secretsFile);
  console.log(`Generating BETTER_AUTH_SECRET for this ${preview ? "Preview" : "Worker"}.`);
}

try {
  run(deploy);
} finally {
  rmSync(secretsFile, { force: true });
}
