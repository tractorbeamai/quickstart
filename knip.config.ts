import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/components/ui/**"],
  ignoreExportsUsedInFile: true,
  // `cloudflare:workers` is a Workers runtime module, not an npm package.
  // `@tanstack/intent` is a CLI agents run to load skills (see AGENTS.md).
  ignoreDependencies: ["@tanstack/intent", "cloudflare"],
};

export default config;
