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
- Add personal notes to highlights, which are saved in context. Hovering over any highlighted text snippet displays your saved personal note in a popup tooltip.

### Interactive Table of Contents (TOC) & Real-Time Reading Progress

- Open the **Outline** side drawer in the Reader header to view automatically extracted `h1`, `h2`, `h3` section headings.
- Click any outline heading to smoothly scroll directly to that section.
- View real-time dynamic time remaining (`"X min left"`) computed live as you scroll.

### Compact Table View & Multi-Select Bulk Actions

- Toggle between **Grid View** (Editorial Cards) and **Compact Table View** in your Library.
- Multi-select articles using checkboxes to perform **Bulk Assign to Room** or **Bulk Delete**.

---

## 2. 🎴 Vocabulary Vault & Active Recall Flashcards

### Word Lookups & Native Audio Pronunciation

- Click or tap any word while reading to open the **Dictionary Popover**.
- Fetches definitions, phonetic pronunciation, and etymology. Save terms to your **Vocabulary Vault** with 1 click.
- Click the speaker icon button (`<Volume2 />`) next to any Vault term or flashcard to listen to clear, native Web Speech TTS audio pronunciation.

### SuperMemo SM-2 Active Recall Flashcards

- Launch **Practice Flashcards** from the top of the Vocabulary Vault.
- **Card Controls**:
  - `Space` or Click to flip between term (Front) and definition/etymology/context (Back).
  - Rate recall with SuperMemo SM-2 memory intervals: `1. Again (<1m)`, `2. Hard (1d)`, `3. Good (3d)`, `4. Easy (7d)`.
  - `Shuffle` option to randomize deck.
  - End-of-deck summary with accuracy score (%) and one-click retry for failed terms.

---

## 3. 📊 365-Day Reading Heatmap & Analytics Engine

- Accessible from the **Insights** tab (`/insights`).
- **365-Day Contribution Heatmap**: GitHub-style 52-week activity grid displaying daily reading consistency with 4 intensity levels (`0 min`, `1-10 min`, `11-25 min`, `26+ min`).
- **Hover Tooltips**: Hover over any heatmap block to view exact date and reading minutes.
- **Analytics Metrics**: Track total articles read, word count totals, average reading WPM, and top tag breakdown.

---

## 4. 📁 My Rooms & AI Concept Studio

- Create topic-based **Rooms** (e.g. _Economics_, _Machine Learning_, _History_).
- Organize articles into rooms for team or personal projects.
- **AI Concept Studio**: Generate multi-article concept summaries, key domain definitions, and cross-document connections using AI (`/api/rooms/[id]/concepts`).
- Export room contents as formatted Markdown or study notes.

---

## 5. 🕸️ Connected Ideas Knowledge Graph

- Visualizes your personal knowledge base as an interactive network graph using `@xyflow/react`.
- Nodes represent articles and vocabulary concepts; edges display room relationships and context links.
- **Connected Node Focus Mode**: Clicking any node highlights its connected neighbors in deep terracotta while dimming unrelated nodes (`opacity: 0.25`).
- **Search Match Counters & Reset Focus**: Search bar displays real-time matching node counts with a 1-click **Reset Focus** button.

---

## 6. 🧩 Companion Chrome Extension

- Save web pages directly from your browser toolbar.
- **Dynamic Room & Tag Selection**: Popup UI fetches your personal Rooms and allows adding custom comma-separated tags (`#ai, #research`) before saving.
- Found in the `chrome-extension/` directory or download 1-click `public/extension.zip`.
