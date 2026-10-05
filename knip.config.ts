import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/components/ui/**"],
  ignore: [
    "src/lib/env-client.ts",
    "src/lib/intake-questions.ts",
    "src/lib/screening-rules.ts",
    "src/server/**",
  ],
  ignoreExportsUsedInFile: true,
  // `cloudflare:workers` is a Workers runtime module, not an npm package.
  ignoreDependencies: ["@tanstack/router-plugin", "cloudflare"],
};

export default config;
