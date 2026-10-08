<!-- intent-skills:start -->

## Skill Loading

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement. Before editing files for a substantial task:

- Run `pnpm exec intent list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm exec intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

# Agent Instructions

## Philosophy

This is a demo/prototype project, NOT production software.

Build for impact, not perfection:

- Prioritize visual polish and wow factor
- Focus on happy path only
- Skip edge cases unless they break the demo
- A beautiful demo in 2 days beats a perfect product never

## Working Guidelines

- Use pnpm (not npm or yarn)
- Prefer small diffs over large rewrites
- Preserve existing code style and patterns
- Use `cn()` from `@/lib/utils` for className merging
- Pages render on the server (TanStack Start on Workers) and hydrate in the browser. Route `beforeLoad` and loaders run on the server for the first request, so keep them free of browser-only APIs

Do not modify:

- `src/components/ui/` - managed by shadcn CLI
- `src/routeTree.gen.ts` - auto-generated

## Where Things Live

| Task | Start in |
| --- | --- |
| Add or change a page | `src/routes/_app/` (inside the sidebar layout, which already provides the centered `max-w-5xl` page container; don't add your own) or `src/routes/` (full-screen); add nav links to `navMain` in `src/components/app-sidebar.tsx` |
| Read or write data from the UI | `src/server/` server functions + TanStack Query options |
| Change tables | `src/db/schema.ts`, then `pnpm db:push` |
| Auth behavior or protected routes | `src/lib/auth.ts`, `src/routes/__root.tsx`, `src/routes/_app/example/account.tsx` |
| Bindings, secrets, Previews | `wrangler.jsonc`, `wrangler.preview-migrations.jsonc`, `.dev.vars.example` |
| Tests and test setup | `*.test.ts` next to the code (import from `vite-plus/test`), `src/test/`, `test` in `vite.config.ts`; tests get wrangler.jsonc's bindings |
| Lint, format, build config | `vite.config.ts` |
| Agent skills, plugins, and MCP | See Agent Setup below |

## Commands

```bash
pnpm dev                              # start dev server (http://localhost:3000)
pnpm test                             # all tests, in workerd against a migrated D1
pnpm test src/lib/auth.test.ts        # one test file
pnpm verify                           # check + test: the gate before you finish
pnpm db:push                          # generate + apply a migration to local D1
pnpm cf-typegen                       # regenerate binding types after editing wrangler.jsonc
pnpm lint path/to/file.tsx            # lint a file with Oxlint
pnpm format path/to/file.tsx          # format a file with Oxfmt
pnpm typecheck                        # type check the project
pnpm check                            # run all static checks
```

## Verification

Prove a change works before calling it done:

- **Run the narrowest check first.** Use one test file or `pnpm lint <file>` while iterating, then `pnpm verify` once at the end. Don't finish with `pnpm verify` failing.
- **Add or update a test** for behavior you change in `src/server/`, `src/lib/`, or `src/db/`. Tests run in workerd with a real, migrated D1 (no mocks), so call the real code: the `db` client, `auth.handler`, and so on.
- **Inspect local data and logs** while `pnpm dev` runs through the Local Explorer API at `http://localhost:3000/cdn-cgi/local/explorer/api`. Use `GET .../d1/database` to find the local D1 and run SQL against it, and `POST .../local/observability/query` to query request traces and console logs with SQL. Fetch `.../explorer/api` for the full OpenAPI schema only if those aren't enough.
- **Check UI changes in a browser** (for example, the `agent-browser` CLI) and include what you saw, not just "it should work".
- **Report evidence**: the commands you ran and their results, in the final message or PR description.

## Database Workflow

The database is Cloudflare D1 (SQLite), so schemas use `drizzle-orm/sqlite-core`. After changing `src/db/schema.ts`, run `pnpm db:push`: it generates a SQL migration in `migrations/` and applies it to the local D1 copy in `.wrangler/`. Commit the migration files. Deploys and Previews apply them remotely; Previews use a shared staging database, never production.

## Auth

Better Auth lives in `src/lib/auth.ts` (server) and `src/lib/auth-client.ts` (browser). The root route puts the session in route context. Protect a route by checking `context.session` in `beforeLoad`; see `src/routes/_app/example/account.tsx`. After signing in, call `useSessionChange()`; sign out with `useSignOut()`. Both live in `src/hooks/use-session-change.ts` and clear the cached session query, which `router.invalidate()` alone would keep serving.

## Library Docs

Library APIs in this stack change faster than model training data. Check current guidance before writing or debugging library-specific code. Use the most specific source first:

1. **Installed skills.** TanStack Router and Start come through Intent (see Skill Loading above). Better Auth comes from a plugin, and Cloudflare (Workers, D1, Wrangler), shadcn/ui, and the AI SDK from `.agents/skills/` (see Agent Setup below).
2. **`docs-index` MCP server.** Its `context` tool searches current first-party documentation and returns a short answer with citations. Use it when:
   - No skill covers the library: Drizzle ORM and drizzle-kit, Tailwind CSS v4, React 19, TanStack Query and Form, Zod 4, Vite+ (`vp`), Oxlint, and Oxfmt.
   - A skill doesn't answer the question, or you need to confirm an API, config option, or CLI flag for the version in `package.json`.
   - You're debugging an error that looks like library behavior (types, config, runtime) rather than this repo's code.

   Pass the library name as `product` and ask a specific implementation question. Don't use it to search this repository; read the code instead.

## Agent Setup

Claude Code and Codex get the same instructions, skills, plugins, and MCP servers. Change both configs together.

| What                     | Claude Code                  | Codex                |
| ------------------------ | ---------------------------- | -------------------- |
| Instructions             | `AGENTS.md`                  | `AGENTS.md`          |
| Skills (`skills` CLI)    | `.claude/skills/` (symlinks) | `.agents/skills/`    |
| Plugins and marketplaces | `.claude/settings.json`      | `.codex/config.toml` |
| MCP servers              | `.mcp.json`                  | `.codex/config.toml` |

- **Plugins:** `auth-skills@better-auth-agent-skills` and `code-style@tractorbeam` work in both agents under the same names. `typescript-lsp` is Claude Code only.
- **Skills without a plugin:** install for both agents with `npx skills add <owner/repo> --skill <name> --agent claude-code codex`. `.agents/skills/` holds the only copy; `.claude/skills/<name>` is a symlink to `../../.agents/skills/<name>`, and the lock is `skills-lock.json`. Never pass `--copy` or commit a real directory under `.claude/skills/`. Update with `npx skills update`. Prefer a plugin when one exists.
- **Cloudflare:** skills come from `cloudflare/skills` through the `skills` CLI, which can install a subset; the Sandbox, Next.js, and Turnstile skills are left out because they don't apply to this app. Its MCP server (`cloudflare`) is configured directly.
- **MCP servers:** `cloudflare` (Cloudflare API, OAuth on first use) and `docs-index`.
- **Codex first run:** trust the project, then run `codex plugin marketplace upgrade` once to fetch the marketplaces in `.codex/config.toml`.

## Do / Do Not

Do:

- Use functional components with hooks
- Use React hooks for local state and TanStack Query for server state
- Use server functions in `src/server/` with `createServerFn`
- Use drizzle-zod to generate Zod schemas from Drizzle tables

Do not:

- Use Redux, Zustand, or other state libraries
- Use array index as React keys
- Add heavy dependencies without approval
- Use inline styles instead of Tailwind

## Known Agent Mistakes

When an agent gets something wrong in a way a rule or script would have prevented, add a line here (or better, a check that catches it). Delete lines that no longer apply.

- `pnpm deploy` runs pnpm's built-in deploy command, not the script. Use `pnpm run deploy`.
- `process.env` isn't how server code reads config. Import `env` from `cloudflare:workers`, or use `@/lib/env-server` for validated secrets.
- Don't hand-edit `.agents/skills/`, `.claude/skills/`, or `skills-lock.json`; they're managed by the `skills` CLI.
- Don't send session tokens to the client. Route context is serialized into the page, so `getSession` in `src/server/auth.ts` returns only the user and expiry.

## Finding Patterns

See README.md for project structure, deployment, and the full command list, and `src/routes/_app/example/` for working reference implementations.
