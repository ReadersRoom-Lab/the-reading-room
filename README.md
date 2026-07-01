# The Reading Room

The Reading Room is a personal reading and knowledge workspace designed for capturing, organizing, and synthesizing information.

## Current State & Features
The application has moved past initial backend scaffolding and now features a rich frontend dashboard and advanced ingestion capabilities:

- **Core Infrastructure**: Next.js 16 + TypeScript, with a hybrid in-memory/Prisma store for flexible persistence.
- **Authentication**: User authentication managed via Clerk.
- **Dashboard & Organization**:
  - **Home Dashboard**: Central hub for your reading activity.
  - **Rooms & Vault**: Organize articles into collaborative or topic-based rooms, and store permanent knowledge in the Vault.
  - **Library & Archive**: Manage your reading backlog and archived materials.
- **Reader View & Annotations**: Distraction-free reading environment with support for highlights and annotations.
- **Content Ingestion**: Import articles seamlessly from PDFs, DOI links, and arXiv.
- **Search & Synthesis**:
  - **Global Search**: Command palette (Cmd+K) for quick navigation and content discovery.
  - **AI Insights**: AI Synthesis Engine integrations (via `@ai-sdk/google`) to help analyze and extract knowledge.
  - **Literature Export**: Easily export your collected research and highlights.

## Run locally
```bash
npm install
npm run dev
```

To run tests and verify core API endpoints:
```bash
npm test
npm run api:smoke
```

## Database setup
See `docs/DATABASE_SETUP.md` for local Postgres/Supabase setup and migrations. The Prisma schema is already configured, and generating the client is handled automatically post-install.

## Verification
- `npm test`
- `npm run build`
