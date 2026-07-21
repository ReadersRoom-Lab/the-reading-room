# Welcome to the ReadrSpace Wiki 📚

**ReadrSpace** (_The Reading Room_) is an intelligent, AI-powered personal reading library, research workspace, and knowledge synthesis suite. It transforms how you save, read, analyze, recall, and connect ideas across articles, web pages, and PDF documents.

---

## 🌟 Key Features Overview

| Feature                                | Description                                                                                                                                                                                |
| :------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📖 **Smart Reading Library**           | Save web articles via URL scraping (Readability.js) or upload PDF documents. Clean clutter-free reading view with progress tracking.                                                       |
| 🎴 **Vocabulary Vault & Flashcards**   | Click any word while reading to fetch definitions, pronunciation, and etymology. Review saved terms using interactive **3D Active Recall Flashcards**.                                     |
| 🤖 **Insights Synthesis Engine**       | A RAG-powered personal library AI assistant (built with **Gemini 2.5 Flash** & **pgvector**) that answers questions grounded directly in your saved articles, highlights, and vault terms. |
| 📁 **My Rooms & AI Concept Studio**    | Organize documents into themed topic rooms. Automatically extract key domain concepts, definitions, and connections across multiple room articles using AI.                                |
| 🕸️ **Connected Ideas Knowledge Graph** | Visualize interactive graph networks connecting your saved articles, room topics, and vocabulary concepts.                                                                                 |
| ⏳ **Spaced Memory & Rediscovery**     | Daily resurfacing cards on your dashboard to review unread or past articles over time.                                                                                                     |
| 🧩 **Companion Chrome Extension**      | Save web pages and selection snippets directly into your ReadrSpace library with 1 click.                                                                                                  |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **Database & ORM**: PostgreSQL + `pgvector` with [Prisma ORM 7](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **AI & Embeddings**: Vercel AI SDK v7, `@ai-sdk/google` (Gemini 2.5 Flash & `text-embedding-004`)
- **Web Scraping & PDF Parsing**: `@mozilla/readability`, `linkedom`, `pdfjs-dist`
- **Deployment & CI**: Vercel, GitHub Actions, SonarCloud Quality Gate

---

## 📖 Wiki Navigation

- 📘 [**Features & User Guide**](Features-Guide) — In-depth walkthrough of all user-facing tools.
- 🛠️ [**Developer & Architecture Guide**](Developer-Architecture-Guide) — Environment setup, Prisma schema, API routes, testing, and CI/CD pipelines.
