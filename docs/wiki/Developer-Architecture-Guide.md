# Developer & Architecture Guide 🛠️

This document covers project setup, database schema architecture, API endpoints, testing, and deployment pipelines for ReadrSpace.

---

## 🚀 1. Local Setup Instructions

### Prerequisites
- **Node.js**: v20 or higher
- **PostgreSQL**: PostgreSQL database with `pgvector` extension enabled.

### Environment Configuration
Copy `.env.example` to `.env` and fill in the credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/readrspace?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/readrspace?schema=public"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

GOOGLE_GENERATIVE_AI_API_KEY="AIzaSy..."
```

### Installation & Database Migration
```bash
npm install
npx prisma db push
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🗄️ 2. Database Schema Architecture (`prisma/schema.prisma`)

Key data models:
- **`User`**: Linked to Clerk authentication (`clerk_id`).
- **`Room`**: Organizational folder for grouping articles.
- **`Article`**: Contains scraped web/PDF content, word count, reading progress, and read time.
- **`ArticleChunk`**: Vector embeddings table storing 1000-char text chunks with `vector` embedding column for RAG search.
- **`Highlight`**: Highlighted passages and optional notes linked to an article.
- **`VaultEntry`**: Saved vocabulary terms, definitions, pronunciation, and etymology.
- **`VaultTrail`**: Join table mapping where a vault term was found (Article, Room, Passage).

---

## ⚡ 3. API Endpoints Reference

| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/articles/save` | `POST` | Ingest web article URL or text content + background chunking |
| `/api/articles/upload` | `POST` | Process and save PDF files |
| `/api/chat` | `POST` | RAG Synthesis AI chat stream (`streamText`) |
| `/api/rooms/[id]/concepts` | `POST` | AI Concept Generator for room articles |
| `/api/vault` | `GET`, `POST`, `DELETE` | CRUD operations for Vocabulary Vault entries |
| `/api/dictionary` | `GET` | Look up definition, pronunciation & etymology |

---

## 🧪 4. Testing & Verification

Run automated test suite:
```bash
npm test              # Run 51 Node.js native unit tests
npm run lint          # Run ESLint check
npx tsc --noEmit      # Verify TypeScript types
```

---

## 🚢 5. CI/CD & Deployment

- **Continuous Integration**: GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint, type-check, and 51 unit tests on every PR.
- **SonarCloud**: Automatic static analysis and quality gate checks.
- **Vercel**: Automatic branch preview deployments (`development`) and production deployments (`main`).
