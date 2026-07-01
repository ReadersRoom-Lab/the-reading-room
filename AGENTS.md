<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent guidance for The Reading Room

## Before writing any code

1. Read `CLAUDE.md` fully — it covers every project-specific gotcha.
2. Check `prisma/schema.prisma` to understand the data model before touching any API route.
3. Run `npx tsc --noEmit` to confirm you haven't broken types.
4. The active app is in `app/` at the project root — the `src/app/api/` directory is legacy dead code.

## Common traps

- **Do not create `middleware.ts`** — the Clerk middleware lives in `proxy.ts`.
- **Do not add `tailwind.config.js`** — Tailwind v4 is configured in CSS, not a config file.
- **Do not import directly from `src/lib/prisma`** — use `@/lib/prisma` so the path alias resolves correctly.
- **Do not hardcode user IDs** — always resolve from `auth()` → `prisma.user.findUnique({ where: { clerk_id: userId } })`.
- **Do not return data without scoping to `user_id`** — returning another user's data is a security bug.
- **Do not add billing, Pro features, or collaborative rooms** — those are V2 scope.
