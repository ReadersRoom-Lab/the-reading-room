export type HighlightType = {
  id: string;
  article_id?: string;
  content: string;
  colour: string;
  note?: string | null;
  annotation_type?: string | null;
  position_start?: number;
  position_end?: number;
};

/**
 * Cleans ugly underscores and site suffixes from article titles.
 * e.g. "Good apologies don't close the book_ they open a new chapter _ Psyche Ideas"
 * => "Good apologies don't close the book: they open a new chapter"
 */
export function cleanArticleTitle(title?: string | null): string {
  if (!title) return "Untitled article";
  let cleaned = title.trim();

  // Strip trailing site branding suffixes like " _ Psyche Ideas", " | Psyche Ideas", " - Psyche Ideas"
  cleaned = cleaned.replace(/\s+[_\-|]\s+[^\n]+$/i, "");

  // Replace underscores between title clauses (e.g. "book_ they open") with colons ": "
  cleaned = cleaned.replaceAll("_ ", ": ");

  // Clean remaining lone underscores with spaces
  cleaned = cleaned.replaceAll("_", " ");

  // Collapse double spaces
  cleaned = cleaned.replace(/[ \t]+/g, " ").trim();

  return cleaned;
}

/**
 * Removes PDF print headers, timestamps, standalone URLs, and page numbers from document text.
 */
export function cleanArticleContent(content?: string | null, title?: string | null): string {
  if (!content) return "";
  let text = content;

  // 1. Strip browser print header timestamps (e.g., "7/3/26, 4:49 PM", "7/3/26, 4:49:12 PM")
  text = text.replace(/\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?/gi, " ");

  // 2. Remove standalone URLs embedded in body text
  text = text.replace(/https?:\/\/[^\s<]+/gi, " ");

  // 3. Remove page numbers like "1/5", "2/5", "Page 1 of 5"
  text = text.replace(/\b\d+\s*\/\s*\d+\b/gi, " ");
  text = text.replace(/\bPage\s+\d+\s+of\s+\d+\b/gi, " ");

  // 4. Remove running page header repetitions of the title
  if (title && title.length > 8) {
    const safeTitle = title.trim().replace(/[.*+?^${}()|[\]\\]/g, String.raw`\\$&`);
    text = text.replace(new RegExp(safeTitle, "gi"), " ");
  }

  // 5. Remove standalone vertical bar site suffixes like "| Psyche Ideas"
  text = text.replace(/\s*\|\s*[A-Za-z0-9]{2,20}(?:\s+[A-Za-z0-9]{2,20})?/g, " ");

  // 6. Format author bylines like "by Alfred Archer and Benjamin Matheson, philosophers"
  text = text.replace(
    /^by\s+([A-Za-z \t,]+)$/gm,
    '<p class="text-base text-muted-foreground font-sans font-medium mb-6 italic">by $1</p>'
  );

  // Clean excessive spaces
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n\s*\n\s*\n+/g, "\n\n").trim();

  return text;
}

/**
 * Extract source domain from standard or scheme-less URLs.
 * Returns domain string like "psyche.co" or "arxiv.org".
 */
export function getArticleSourceDomain(url?: string | null): string {
  if (!url) return "the-reading-room";
  if (url.startsWith("upload://") || url.startsWith("file://")) return "upload";

  let cleanUrl = url.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`;
  }

  try {
    const parsed = new URL(cleanUrl);
    return parsed.hostname.replace(/^www\./i, "");
  } catch {
    return "the-reading-room";
  }
}

/**
 * Bionic Reading transformer: highlights the first 40-50% of each word in bold text
 * to guide the eye across text lines effortlessly.
 */
export function applyBionicReading(html: string): string {
  if (!html) return "";

  // Replace text content outside of HTML tags (<...>)
  return html.replace(/(>|^)([^<]+)(?=<|$)/g, (_match, prefix, textContent) => {
    const transformedText = textContent.replace(/\b([A-Za-z0-9]+)\b/g, (word: string) => {
      if (word.length <= 1) return word;
      const highlightLength = Math.max(1, Math.ceil(word.length * 0.45));
      const boldPart = word.slice(0, highlightLength);
      const restPart = word.slice(highlightLength);
      return `<strong class="font-bold opacity-100">${boldPart}</strong><span class="opacity-90">${restPart}</span>`;
    });
    return `${prefix}${transformedText}`;
  });
}

/**
 * Intelligent formatter for article content in Reader Mode.
 * - Formats raw text, Markdown, or HTML into structured, elegant HTML paragraphs and elements.
 * - Cleans print headers, footers, page numbers, and title artifacts.
 * - Auto-detects subheadings, lists, and footnote references.
 * - Preserves & highlights pre-existing document highlights (HTML <mark>, <span class="highlight">, ==markdown==, [highlight]).
 * - Applies database-backed user highlights with custom colors & metadata.
 */
export function formatArticleContentHtml(
  articleContent?: string | null,
  highlights: HighlightType[] = [],
  title?: string | null,
  isBionic = false
): { __html: string } {
  if (!articleContent || articleContent.trim() === "") {
    return {
      __html: "<p class='text-muted-foreground italic'>No content available for this article.</p>",
    };
  }

  // Clean content first
  let html = cleanArticleContent(articleContent, title);

  if (!html || html.trim() === "") {
    return {
      __html: "<p class='text-muted-foreground italic'>No content available for this article.</p>",
    };
  }

  // 1. Process pre-existing highlight syntax in the raw document
  // A) Markdown highlight syntax: ==highlighted text==
  html = html.replace(
    /==([^=\n]+)==/g,
    '<mark class="bg-[#FCD116]/40 dark:bg-[#FCD116]/30 text-inherit rounded-sm px-1 py-0.5 font-medium">$1</mark>'
  );

  // B) Bracket highlight syntax: [[highlight: text]] or [highlight]text[/highlight]
  html = html.replace(
    /\[\[highlight:\s*([^\]]+)\]\]/gi,
    '<mark class="bg-[#FCD116]/40 dark:bg-[#FCD116]/30 text-inherit rounded-sm px-1 py-0.5 font-medium">$1</mark>'
  );
  html = html.replace(
    /\[highlight\]([\s\S]*?)\[\/highlight\]/gi,
    '<mark class="bg-[#FCD116]/40 dark:bg-[#FCD116]/30 text-inherit rounded-sm px-1 py-0.5 font-medium">$1</mark>'
  );

  // C) Pre-existing HTML <mark> tags without classes or with generic styles
  html = html.replace(
    /<mark(?![^>]*data-highlight-id)([^>]*)>([\s\S]*?)<\/mark>/gi,
    (_match, attrs, content) => {
      if (attrs.includes("class=")) {
        return `<mark${attrs}>${content}</mark>`;
      }
      return `<mark class="bg-[#FCD116]/40 dark:bg-[#FCD116]/30 text-inherit rounded-sm px-1 py-0.5 font-medium"${attrs}>${content}</mark>`;
    }
  );

  // D) Pre-existing HTML <span class="highlight..."> or <span style="...background...">
  html = html.replace(
    /<span\s+[^>]*class=["'][^"']*highlight[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi,
    '<mark class="bg-[#FCD116]/40 dark:bg-[#FCD116]/30 text-inherit rounded-sm px-1 py-0.5 font-medium">$1</mark>'
  );
  html = html.replace(
    /<span\s+[^>]*style=["'][^"']*background(?:-color)?:\s*[^"';]+["'][^>]*>([\s\S]*?)<\/span>/gi,
    '<mark class="bg-[#FCD116]/40 dark:bg-[#FCD116]/30 text-inherit rounded-sm px-1 py-0.5 font-medium">$1</mark>'
  );

  // 2. Intelligent Markdown & Plain Text to HTML conversion if document lacks HTML block tags (<p>, <div>, <article>, <header>)
  const hasHtmlBlocks =
    /<(p|div|article|header|section|table|blockquote|ul|ol|h[1-6])\b[^>]*>/i.test(html);

  if (!hasHtmlBlocks) {
    // Convert Markdown headers
    html = html.replace(
      /^#### (.*$)/gim,
      '<h4 class="font-heading text-lg font-bold mt-6 mb-3">$1</h4>'
    );
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="font-heading text-xl font-bold mt-8 mb-4">$1</h3>'
    );
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="font-heading text-2xl font-bold mt-10 mb-4 pb-2 border-b border-border/50">$1</h2>'
    );
    html = html.replace(
      /^# (.*$)/gim,
      '<h1 class="font-heading text-3xl font-bold mt-12 mb-6">$1</h1>'
    );

    // Auto-detect uppercase headings in raw text (e.g. "1. INTRODUCTION", "BACKGROUND", "II. METHODOLOGY")
    html = html.replace(
      /^([0-9IVX]+\.\s+[A-Z\s]{4,60}|[A-Z\s]{4,50})$/gm,
      '<h2 class="font-heading text-2xl font-bold mt-10 mb-4 pb-2 border-b border-border/50">$1</h2>'
    );

    // Convert Markdown blockquotes
    html = html.replace(
      /^>\s?(.*$)/gim,
      '<blockquote class="border-l-4 border-primary/50 pl-4 py-1 my-6 italic text-[#52525B] dark:text-muted-foreground bg-muted/20">$1</blockquote>'
    );

    // Convert Markdown code blocks
    html = html.replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-6 font-mono text-sm border border-border/60"><code>$1</code></pre>'
    );

    // Convert inline code
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-primary">$1</code>'
    );

    // Convert Markdown bold & italic
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/_([^_]+)_/g, "<em>$1</em>");

    // Convert bracket citation numbers [1], [2] to superscript badges
    html = html.replace(
      /\[(\d{1,3})\]/g,
      '<sup class="font-mono text-[11px] font-semibold text-primary bg-primary/10 px-1 py-0.5 rounded cursor-pointer select-none">[$1]</sup>'
    );

    // Convert double newlines into clean paragraph tags <p>
    const rawParagraphs = html
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const formattedParagraphs: string[] = [];

    rawParagraphs.forEach((p) => {
      if (/^<(h[1-6]|blockquote|pre|ul|ol|p|div)\b/i.test(p)) {
        formattedParagraphs.push(p);
        return;
      }

      // Check if paragraph is a bullet/numbered list
      const lines = p.split(/\n+/);
      const isBulletList = lines.every((line) => /^[\s]*[•\-\*]\s+/.test(line));
      const isNumberedList = lines.every((line) => /^[\s]*\d+\.\s+/.test(line));

      if (isBulletList) {
        const listItems = lines
          .map(
            (line) =>
              `  <li class="mb-2 leading-relaxed">${line.replace(/^[\s]*[•\-\*]\s+/, "")}</li>`
          )
          .join("\n");
        formattedParagraphs.push(
          `<ul class="list-disc pl-6 my-6 space-y-1 text-inherit">\n${listItems}\n</ul>`
        );
        return;
      }

      if (isNumberedList) {
        const listItems = lines
          .map(
            (line) =>
              `  <li class="mb-2 leading-relaxed">${line.replace(/^[\s]*\d+\.\s+/, "")}</li>`
          )
          .join("\n");
        formattedParagraphs.push(
          `<ol class="list-decimal pl-6 my-6 space-y-1 text-inherit">\n${listItems}\n</ol>`
        );
        return;
      }

      // Break long unformatted text blocks (>450 chars) by sentence endings so text never feels like a giant wall
      if (p.length > 450) {
        const sentences = p.split(/(?<=[.!?])\s+/);
        let currentChunk = "";

        sentences.forEach((sentence) => {
          if ((currentChunk + " " + sentence).length > 380 && currentChunk.length > 0) {
            formattedParagraphs.push(
              `<p class="leading-relaxed mb-8 font-normal text-inherit [&:first-of-type]:first-letter:text-5xl [&:first-of-type]:first-letter:font-serif [&:first-of-type]:first-letter:font-bold [&:first-of-type]:first-letter:float-left [&:first-of-type]:first-letter:mr-3 [&:first-of-type]:first-letter:leading-none [&:first-of-type]:first-letter:text-primary">${currentChunk.trim()}</p>`
            );
            currentChunk = sentence;
          } else {
            currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
          }
        });

        if (currentChunk.trim().length > 0) {
          formattedParagraphs.push(
            `<p class="leading-relaxed mb-8 font-normal text-inherit [&:first-of-type]:first-letter:text-5xl [&:first-of-type]:first-letter:font-serif [&:first-of-type]:first-letter:font-bold [&:first-of-type]:first-letter:float-left [&:first-of-type]:first-letter:mr-3 [&:first-of-type]:first-letter:leading-none [&:first-of-type]:first-letter:text-primary">${currentChunk.trim()}</p>`
          );
        }
      } else {
        const formattedPara = p.replace(/\n/g, "<br />");
        formattedParagraphs.push(
          `<p class="leading-relaxed mb-8 font-normal text-inherit [&:first-of-type]:first-letter:text-5xl [&:first-of-type]:first-letter:font-serif [&:first-of-type]:first-letter:font-bold [&:first-of-type]:first-letter:float-left [&:first-of-type]:first-letter:mr-3 [&:first-of-type]:first-letter:leading-none [&:first-of-type]:first-letter:text-primary">${formattedPara}</p>`
        );
      }
    });

    html = formattedParagraphs.join("\n\n");
  }

  // 3. Apply DB User Highlights
  if (highlights && highlights.length > 0) {
    const sorted = [...highlights].sort((a, b) => b.content.length - a.content.length);

    sorted.forEach((h) => {
      if (!h.content || h.content.trim() === "") return;

      let colorClass = "bg-[#FCD116]/40 dark:bg-[#FCD116]/30 text-inherit"; // Ochre / Yellow
      if (h.colour === "sage") {
        colorClass = "bg-[#8DA399]/50 dark:bg-[#8DA399]/40 text-inherit";
      } else if (h.colour === "crimson") {
        colorClass = "bg-[#9A3B3B]/40 dark:bg-[#9A3B3B]/30 text-inherit";
      } else if (h.colour === "indigo") {
        colorClass = "bg-[#4F709C]/40 dark:bg-[#4F709C]/30 text-inherit";
      }

      const safeContent = h.content.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\\$&`);
      const regex = new RegExp(`(${safeContent})`, "g");

      const hasMetadata = Boolean(h.note || h.annotation_type);
      const borderClass = hasMetadata ? "border-b-2 border-foreground/40" : "";
      const noteTitle = h.note ? `title="Note: ${h.note.replaceAll('"', "&quot;")}"` : "";

      html = html.replace(
        regex,
        `<mark data-highlight-id="${h.id}" ${noteTitle} class="${colorClass} ${borderClass} rounded-sm px-1 py-0.5 cursor-pointer hover:opacity-80 transition-opacity">$1</mark>`
      );
    });
  }

  // 4. Optionally apply Bionic Reading transformation
  if (isBionic) {
    html = applyBionicReading(html);
  }

  return { __html: html };
}
