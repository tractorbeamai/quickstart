// Deploy the Worker (or a Preview with --preview), generating any missing
// secrets on the way. A secret that already exists is never replaced, so
// redeploys don't rotate BETTER_AUTH_SECRET and sign everyone out.
// Usage: node scripts/deploy.mjs [--preview]
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const GENERATED_SECRETS = ["BETTER_AUTH_SECRET"];

const preview = process.argv.includes("--preview");
const wrangler = (args, options) => spawnSync("pnpm", ["exec", "wrangler", ...args], options);

// Listing fails before the first deploy of a Worker or Preview; every secret
// counts as missing then.
const listing = wrangler(preview ? ["preview", "secret", "list", "--json"] : ["secret", "list"], {
  encoding: "utf8",
});
const existing = listing.status === 0 ? listing.stdout : "";
const missing = GENERATED_SECRETS.filter((name) => !existing.includes(`"${name}"`));

const deployArgs = preview ? ["preview"] : ["deploy"];
let secretsDir;
if (missing.length > 0) {
  secretsDir = mkdtempSync(join(tmpdir(), "quickstart-secrets-"));
  const secretsFile = join(secretsDir, "secrets.json");
  const secrets = Object.fromEntries(
    missing.map((name) => [name, randomBytes(32).toString("base64")]),
  );
  writeFileSync(secretsFile, JSON.stringify(secrets), { mode: 0o600 });
  deployArgs.push("--secrets-file", secretsFile);
  console.log(`Generating ${missing.join(", ")} for this ${preview ? "Preview" : "Worker"}.`);
}

const result = wrangler(deployArgs, { stdio: "inherit" });
if (secretsDir) {
  rmSync(secretsDir, { recursive: true, force: true });
}
process.exit(result.status ?? 1);
