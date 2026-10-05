import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // Claude Code runs the hook scripts; see `hooks` in .claude/settings.json.
  entry: ["src/components/ui/**", ".claude/hooks/*.mjs"],
  ignore: [
    "src/lib/env-client.ts",
    "src/lib/intake-questions.ts",
    "src/lib/screening-rules.ts",
    "src/server/**",
  ],
  ignoreExportsUsedInFile: true,
  // `cloudflare:workers` is a Workers runtime module, not an npm package.
  // `@tanstack/intent` is a CLI agents run to load skills (see AGENTS.md).
  ignoreDependencies: ["@tanstack/intent", "@tanstack/router-plugin", "cloudflare"],
};

export default config;
