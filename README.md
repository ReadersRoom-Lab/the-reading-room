# The Reading Room

A personal reading and knowledge workspace. Save articles from the web, organise them into rooms, highlight key passages, build a vocabulary vault, and surface insights with AI.

**Stack:** Next.js 16 · React 19 · TypeScript · Prisma 7 · PostgreSQL · Clerk · Tailwind CSS 4 · Google AI SDK

---

## 📖 Core Workflow

The Reading Room is built around a simple, powerful 4-step workflow:

1. **Build Your Library**: Save articles directly from your browser using the Chrome Extension (bypassing paywalls), or manually upload PDFs and paste URLs.
2. **Read & Annotate**: Experience a minimalist, editorial reader. Highlight important passages, add personal notes, and categorize them.
3. **Grow Your Vault**: Select any unfamiliar word or concept while reading to instantly fetch its Wikipedia definition. It is automatically saved to your Vault for spaced rediscovery.
4. **Organize into Rooms**: Curate your knowledge by grouping related articles into thematic Spaces (Rooms). Export entire rooms to Markdown for easy sharing.

---

## 🧩 The Reading Room Chrome Extension

The absolute best way to save articles to your library is using the companion Chrome Extension. It saves exactly what is rendered on your screen, which completely bypasses paywalls and anti-bot protections.

**How to install:**

1. Navigate to `chrome://extensions/` in your Chrome browser.
2. Toggle on **Developer mode** in the top right corner.
3. Click **Load unpacked** in the top left.
4. Select the `chrome-extension` folder located inside this repository.
5. Pin the extension to your toolbar.
6. **Connect your Workspace**: Open your Reading Room application in Chrome (e.g. `http://localhost:3000` or your production domain), click the extension icon, and click **Connect Workspace**.
7. **Start saving**: Navigate to any article on the web, click the extension icon, and click **Save to Library**!

**Publishing to the Chrome Web Store:**
If you wish to publish this extension to the Chrome Web Store for one-click installation, please refer to the detailed [Chrome Web Store Submission Guide](file:///c:/Users/ASUS/Documents/personal/Readers_Room/readers-room/docs/chrome-web-store-submission.md).

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 20+
- PostgreSQL database (local or [Supabase](https://supabase.com) free tier)
- [Clerk](https://clerk.com) account (free tier)
- [Google AI Studio](https://aistudio.google.com) API key (free tier)

### 2. Clone and install

```bash
git clone https://github.com/ReadersRoom-Lab/the-reading-room
cd the-reading-room
npm install
```

### 3. Environment variables

The `.env` file already exists but has placeholders. You need real values for:

- **`DATABASE_URL`** — easiest option: create a free Supabase project → Project Settings → Database → Connection string (URI)
- **`CLERK_SECRET_KEY`** and **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** — create a free app at clerk.com → API Keys
- **`CLERK_WEBHOOK_SECRET`** — in Clerk dashboard → Webhooks → create an endpoint pointing to your domain (for local dev, skip this initially — sign-up will work but user sync won't fire)
- **`GOOGLE_GENERATIVE_AI_API_KEY`** — [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (free)

### 4. Database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Run

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## 🛠️ Code Quality & Local Verification

To maintain code quality and prevent errors, we use strict linting, type checks, and formatting rules that run locally and on our GitHub Action CI/CD pipeline:

### 1. Verification Commands
Run these commands locally to verify your code is clean before pushing:
* **Format Check**: `npm run format:check` (checks codebase formatting using Prettier)
* **Linting**: `npm run lint` (checks code quality and styling using ESLint)
* **TypeScript Compilation**: `npx tsc --noEmit` (verifies type safety)
* **Tests**: `npm test` (runs all 39 unit tests)
* **Full Production Build**: `npm run build` (tests Next.js compilation and extension packaging)

### 2. Local Pre-Commit Hooks
Every time you run `git commit`, Husky and `lint-staged` automatically run `prettier --write` and `eslint --fix` on your modified files. If any formatting or syntax errors are found and cannot be automatically resolved, your commit will be blocked.

### 3. Branch Protection & CI Gates
All code pushed to GitHub must pass the `.github/workflows/ci.yml` pipeline (`Build, Lint, and Test` checks) and the SonarCloud code quality scanner. Pull requests cannot be merged into `main` unless all automated tests and compilation checks succeed.

---

## 🎨 UI / UX Aesthetic

The app uses a custom **"Scholarly Minimalism"** (Parchment & Ink) aesthetic:

- A `0px` border-radius policy on all interactive elements (buttons, inputs, cards).
- Flat backgrounds with simple ink borders instead of heavily layered drop-shadows.
- Typography prioritizes high legibility with classic serif reading options and crisp sans-serif menus.
- Consistent metadata trailing borders to group related information intuitively.

---

## ✨ Features Log (Implemented)

1. **Dashboard & Extension Integration**: Clean hero layouts with direct instructions for the companion Chrome extension.
2. **Onboarding Flow & Enforcement**: Multi-step client onboarding flow capturing Name and positive Goals, creating the user's first Room.
3. **Room Management & Curated Shelves**: Create, update, and permanently delete rooms. Dynamic highlights count and Room Markdown exporting.
4. **Reader & Vault Concept Lookup**: Custom memoized selection hook to highlight text. Popover dictionary with Wikipedia REST integration to dynamically fetch definitions and save them directly to the Vault for spaced rediscovery.
5. **Insights Studio Dashboard**: Stats compiler endpoint calculating reading streak history. 365-day contribution heatmap grid, custom SVG Knowledge Growth line chart, and horizontal active rooms bar chart.
6. **Robust AI Chat**: An intelligent chat assistant to query your saved documents using Google's Gemini SDK.
7. **Enhanced UX & Interactions**: OS-aware keyboard shortcuts (e.g., automatically displaying `⌘` or `Ctrl`) and streamlined workflows like creating new rooms directly from the article assignment dropdown without losing context.
8. **Accessibility & Performance Pass**: Scored perfect 100/100 on strict Lighthouse WCAG audits (ARIA roles, heading hierarchies, landmarks) and achieved 95+ performance via heavily optimized WebP Next.js image loading and CSS base64-encoded textures.
9. **Mobile Responsiveness**: Fully responsive dashboard with a dedicated bottom/top navigation, optimized reading experience, and auto-hiding sidebars for phone browsers. Resolved 100dvh flex layout clipping bugs across all viewports.
10. **Code Quality & Test Coverage**: Achieved 100% test coverage tracked via SonarCloud. Migrated to 'c8' for accurate source-mapped LCOV reporting and eliminated transpiler coverage noise.
11. **Edge-Optimized Architecture**: Achieved a 90+ Vercel Real Experience Score by statically generating the landing page and shifting authentication checks to Clerk's Edge Middleware (slashing TTFB/FCP). Resolved massive initial payloads by dynamically lazy-loading `pdfjs-dist` worker instances.

---

## 🗺️ Product Roadmap (V2 & V3)

We are actively building toward becoming the ultimate scholarly workspace. Upcoming capabilities include:

- **Collaborative Rooms (V2)**: Share thematic spaces and highlights seamlessly with peers using Clerk Organizations.
- **Third-Party Syncing (V3)**: An OAuth pipeline to automatically push highlights directly to Notion and Obsidian.
- **Premium Text-to-Speech & AI Audio (V3)**: A sticky floating audio player serving high-quality, AI-generated reading audio for articles on the go.
- **Omnichannel Ingestion (V3)**: Expanding our pipeline to parse EPUBs, RSS feeds, and YouTube transcripts natively.
- **AI "Ghostreader" Automation (V3)**: Automated background queues generating TL;DRs, auto-tags, and comprehension flashcards the moment you save an article.

---

## 🚀 Deployment

Tested for Vercel. The `postinstall` script runs `prisma generate` automatically on deploy. Set all `.env.example` variables in Vercel's environment variables panel. Point your Clerk webhook to your production domain.
