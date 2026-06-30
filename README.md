# The Reading Room

The Reading Room is a free-tier personal reading and knowledge workspace. The current backend focus is on article saving, rooms, highlights, and the foundation for vault/archive features from the V1.0 plan.

## Current state
- Next.js + TypeScript app scaffolded
- Initial REST endpoints for rooms, articles, highlights, and health
- Temporary in-memory store for rapid development
- Regression test covering room and article creation

## Run locally
```bash
npm install
npm test
npm run dev
```

## Project handoff notes
- Keep API routes in src/app/api.
- Keep shared logic in src/lib.
- Follow the V1.0 scope from the PDF and avoid Pro/PDF/research-room work for now.
- The next backend milestones are Prisma + Supabase persistence, Clerk auth, and article ingestion.

## Verification
- npm test
- npm run build
