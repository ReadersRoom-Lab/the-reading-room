# The Reading Room

The Reading Room is a free-tier personal reading and knowledge workspace. The current backend focus is on article saving, rooms, highlights, and the foundation for vault/archive features from the V1.0 plan.

## Current state
- Next.js + TypeScript app scaffolded
- Initial REST endpoints for rooms, articles, highlights, and health
- Prisma schema and generated client configured
- Hybrid in-memory/Prisma store supports development without a database and persistence when `DATABASE_URL` is set
- Regression test covering room and article creation
- Verified with `npm test` and `npm run build`

## Run locally
```bash
npm install
npm test
npm run dev
npm run api:smoke
```

Start the app with `npm run dev`, then run `npm run api:smoke` to verify the core API endpoints against `localhost:3000`.

## Database setup
See `docs/DATABASE_SETUP.md` for local Postgres/Supabase setup and migrations.

## Project handoff notes
- Keep API routes in `src/app/api`.
- Keep shared domain logic in `src/lib`.
- Follow the V1.0 scope from the PDF and avoid Pro/PDF/research-room work in this phase.
- The next backend milestones are Clerk auth, article ingestion, and room/article CRUD persistence.

## Verification
- npm test
- npm run build
