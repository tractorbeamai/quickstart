// Build, migrate D1, and deploy the Worker (or a Preview with --preview).
// Generates BETTER_AUTH_SECRET if the target doesn't have one yet, and never
// replaces an existing one, so redeploys don't sign everyone out.
// Usage: node scripts/deploy.mjs [--preview]
import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unstable_readConfig } from "wrangler";

const preview = process.argv.includes("--preview");
const run = (args) => execFileSync("pnpm", args, { stdio: "inherit" });
// `pnpm run` puts node_modules/.bin on PATH, so call wrangler directly for
// clean stdout (no pnpm banner in front of JSON output).
const wrangler = (args) => spawnSync("wrangler", args, { encoding: "utf8" });

// Workers Builds runs the build command before this deploy command.
if (!process.env.WORKERS_CI) {
  run(["build"]);
}

// `wrangler deploy` provisions a missing D1 database, but migrations run
// first and don't, so create it on a first deploy from a fresh account.
// Only create when the listing succeeds and lacks it; a failed listing
// (transient API error) must not be mistaken for a missing database.
const config = preview ? "wrangler.preview-migrations.jsonc" : "wrangler.jsonc";
const database = unstable_readConfig({ config }).d1_databases[0]?.database_name;
if (database) {
  const listing = wrangler(["d1", "list", "--json"]);
  if (listing.status !== 0) {
    throw new Error(`wrangler d1 list failed:\n${listing.stderr}`);
  }
  if (!JSON.parse(listing.stdout).some((d) => d.name === database)) {
    run(["exec", "wrangler", "d1", "create", database, "--no-update-config"]);
  }
}
run([preview ? "db:migrate:preview" : "db:migrate:remote"]);

// Listing fails before a Worker or Preview's first deploy; treat that as missing.
const secrets = wrangler(
  preview ? ["preview", "secret", "list", "--json"] : ["secret", "list", "--format", "json"],
);
const hasSecret = secrets.status === 0 && secrets.stdout.includes('"BETTER_AUTH_SECRET"');

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
