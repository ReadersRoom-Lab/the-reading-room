# Features & User Guide 📖

This guide details all key features of ReadrSpace and how to use them to elevate your reading and research workflow.

---

## 1. 📚 Reading Library & Document Reader

### URL Ingestion & Readability
- Enter any article or web page URL in the **Save Document** dialog.
- ReadrSpace uses `@mozilla/readability` to strip ads, popups, and sidebars, delivering a clean typography-focused reader layout.

### PDF Document Support
- Drag and drop PDF files into the upload zone.
- Text content is parsed (`pdfjs-dist`) and indexed for vector search.

### Highlight & Note Annotation
- Select text in any article to highlight in custom colors.
- Add personal notes to highlights, which are saved in context.

---

## 2. 🎴 Vocabulary Vault & Active Recall Flashcards

### Word Lookups
- Click or tap any word while reading to open the **Dictionary Popover**.
- Fetches definitions, phonetic pronunciation, and etymology. Save terms to your **Vocabulary Vault** with 1 click.

### Active Recall 3D Flashcards
- Launch **Practice Flashcards** from the top of the Vocabulary Vault.
- **Card Controls**:
  - `Space` or Click to flip between term (Front) and definition/etymology/context (Back).
  - Rate recall: `1. Again` (Red), `2. Hard` (Amber), `3. Good` (Blue), `4. Easy` (Green).
  - `Shuffle` option to randomize deck.
  - End-of-deck summary with accuracy score (%) and one-click retry for failed terms.

---

## 3. 🤖 Insights & Synthesis Engine

- Accessible from the **Insights** tab.
- Powered by **Gemini 2.5 Flash** and semantic vector search (`pgvector` with `text-embedding-004`).
- **Direct Library Access**: The assistant receives your saved articles, highlights, and vault terms in context.
- **Rich Formatting**: Returns structured markdown with headers, bolding, and bullet points, rendered safely.
- Cites article titles inline when drawing answers from your saved documents.

---

## 4. 📁 My Rooms & AI Concept Studio

- Create topic-based **Rooms** (e.g. *Economics*, *Machine Learning*, *History*).
- Organize articles into rooms for team or personal projects.
- **AI Concept Studio**: Generate multi-article concept summaries, key domain definitions, and cross-document connections using AI (`/api/rooms/[id]/concepts`).
- Export room contents as formatted Markdown or study notes.

---

## 5. 🕸️ Connected Ideas Knowledge Graph

- Visualizes your personal knowledge base as an interactive network graph using `@xyflow/react`.
- Nodes represent articles and vocabulary concepts; edges display room relationships and context links.
- Filter by node type (*Articles*, *Concepts*) or search node titles.

---

## 6. 🧩 Companion Chrome Extension

- Save web pages directly from your browser toolbar.
- Highlight text on any web page to send directly to your ReadrSpace library.
- Found in the `chrome-extension/` directory.
