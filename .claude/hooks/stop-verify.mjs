// Stop hook: Claude can't finish while `pnpm verify` (check + test) fails.
// Exit code 2 sends stderr back to Claude and keeps it working.
// https://code.claude.com/docs/en/hooks
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
const cwd = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

// Already continuing because of this hook: let it stop rather than loop.
if (input.stop_hook_active) {
  process.exit(0);
}

// Nothing changed (questions, research): skip the gate.
const changes = execFileSync("git", ["status", "--porcelain"], { cwd, encoding: "utf8" });
if (changes.trim() === "") {
  process.exit(0);
}

const result = spawnSync("pnpm", ["--silent", "verify"], { cwd, encoding: "utf8" });
if (result.status !== 0) {
  const output = `${result.stdout}${result.stderr}`.trim().split("\n").slice(-60).join("\n");
  console.error(`\`pnpm verify\` failed. Fix these before finishing:\n\n${output}`);
  process.exit(2);
}
