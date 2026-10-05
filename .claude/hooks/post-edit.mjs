// PostToolUse hook: format each edited file and report lint findings to
// Claude right away. It can't undo the edit; the Stop hook is the real gate.
// https://code.claude.com/docs/en/hooks
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { relative } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
const cwd = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const file = input.tool_input?.file_path;

if (!file || relative(cwd, file).startsWith("..")) {
  process.exit(0);
}

if (/\.(?:css|json|jsonc|md|mjs|ts|tsx)$/u.test(file)) {
  spawnSync("pnpm", ["exec", "vp", "fmt", file], { cwd });
}

if (/\.(?:mjs|ts|tsx)$/u.test(file)) {
  const lint = spawnSync("pnpm", ["exec", "vp", "lint", file], { cwd, encoding: "utf8" });
  if (lint.status !== 0) {
    console.error(`Lint findings in ${relative(cwd, file)}:\n${lint.stdout}${lint.stderr}`);
    process.exit(2);
  }
}
