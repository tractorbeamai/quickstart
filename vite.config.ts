import { cloudflare } from "@cloudflare/vite-plugin";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import oxlintConfig from "@tractorbeam/oxlint-config";
import oxfmtConfig from "@tractorbeam/oxfmt-config";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

const lint = oxlintConfig();

const generatedPatterns = [
  // Vendored by the `skills` CLI; edits would drift from skills-lock.json.
  ".agents/skills/**",
  ".claude/skills/**",
  "skills-lock.json",
  ".tanstack/**",
  ".wrangler/**",
  "migrations/meta/**",
  "worker-configuration.d.ts",
];

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  // The README and docs link to http://localhost:3000.
  server: {
    port: 3000,
  },
  // Vitest loads this file too; the Workers dev plugin conflicts with its
  // server, and tests bring their own plugins in `test.projects` below.
  plugins: process.env.VITEST
    ? []
    : [
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
      // Default in the next @tractorbeam/oxlint-config release; drop once on it.
      "no-nested-ternary": "error",
    },
  },
  ssr: {
    noExternal: ["streamdown"],
  },
  // Vite leaves server builds unminified by default; minify the Worker bundle,
  // since its compressed size counts against Cloudflare's script size limit.
  environments: {
    ssr: { build: { minify: true } },
  },
  test: {
    projects: [
      {
        // Inline projects don't inherit the app plugins above, so tests run in
        // workerd with only the Workers test integration loaded.
        resolve: { tsconfigPaths: true },
        plugins: [
          cloudflareTest(async () => ({
            wrangler: { configPath: "./wrangler.jsonc" },
            // wrangler.jsonc's `main` only resolves inside the app build.
            main: "./src/test/worker.ts",
            // Override .dev.vars so tests behave the same locally and in CI.
            miniflare: {
              bindings: {
                BETTER_AUTH_SECRET: "test-secret-at-least-32-characters-long",
                TEST_MIGRATIONS: await readD1Migrations("migrations"),
              },
            },
          })),
        ],
        test: {
          name: "workers",
          include: ["src/**/*.test.ts"],
          setupFiles: ["src/test/setup.ts"],
        },
      },
    ],
  },
});
