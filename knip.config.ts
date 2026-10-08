import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // The Workers test pool loads src/test/worker.ts as its `main` (vite.config.ts).
  entry: ["src/components/ui/**", "src/test/worker.ts"],
  ignoreExportsUsedInFile: true,
  // `cloudflare:workers` is a Workers runtime module, not an npm package.
  // `@tanstack/intent` is a CLI agents run to load skills (see AGENTS.md).
  ignoreDependencies: ["@tanstack/intent", "cloudflare"],
};

export default config;
