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
- Client-only rendering - no SSR or server-side React

Do not modify:

- `src/components/ui/` - managed by shadcn CLI
- `src/routeTree.gen.ts` - auto-generated

## Commands

```bash
pnpm dev                              # start dev server
pnpm db:push                          # generate + apply a migration to local D1
pnpm cf-typegen                       # regenerate binding types after editing wrangler.jsonc
pnpm lint path/to/file.tsx            # lint a file with Oxlint
pnpm format path/to/file.tsx          # format a file with Oxfmt
pnpm typecheck                        # type check the project
pnpm check                            # run all static checks
```

## Database Workflow

The database is Cloudflare D1 (SQLite), so schemas use `drizzle-orm/sqlite-core`. Server code reads the `DB` binding and secrets through `cloudflare:workers`, not `process.env`.

**Local development:** After changing `src/db/schema.ts`, run `pnpm db:push`. It generates a SQL migration in `migrations/` and applies it to the local D1 copy in `.wrangler/`. Commit the migration files.

**Deploying:** `pnpm run deploy` (not `pnpm deploy`, which is a pnpm built-in) applies pending migrations to the remote D1 database before running `wrangler deploy`.

## Auth

Better Auth lives in `src/lib/auth.ts` (server) and `src/lib/auth-client.ts` (browser). The root route puts the session in route context. Protect a route by checking `context.session` in `beforeLoad`; see `src/routes/example/account.tsx`. Call `router.invalidate()` after signing in or out.

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

## Finding Patterns

See README.md for:

- Project structure
- Full command reference
- Code patterns (routing, server functions, state, AI)

See `src/routes/example/` for working reference implementations.
