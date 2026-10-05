import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import oxlintConfig from "@tractorbeam/oxlint-config";
import oxfmtConfig from "@tractorbeam/oxfmt-config";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

const lint = oxlintConfig();

const generatedPatterns = [
  ".tanstack/**",
  ".wrangler/**",
  "migrations/meta/**",
  "worker-configuration.d.ts",
];

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  // Keep in sync with BETTER_AUTH_URL in .dev.vars.
  server: {
    port: 3000,
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    viteReact(),
    tailwindcss(),
  ],
  fmt: {
    ...oxfmtConfig,
    ignorePatterns: [...oxfmtConfig.ignorePatterns, ...generatedPatterns],
  },
  lint: {
    ...lint,
    ignorePatterns: ["**/*.gen.*", ...generatedPatterns, "src/components/ui/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      ...lint.rules,
      "import/no-namespace": ["error", { ignore: ["@/db/schema"] }],
      "no-console": "off",
    },
    overrides: [
      {
        files: ["src/db/seed.ts"],
        rules: {
          "no-await-in-loop": "off",
        },
      },
    ],
  },
  ssr: {
    noExternal: ["streamdown"],
  },
});
