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
 * Intelligent formatter for article content in Reader Mode.
 * - Formats raw text, Markdown, or HTML into structured, elegant HTML paragraphs and elements.
 * - Preserves & highlights pre-existing document highlights (HTML <mark>, <span class="highlight">, ==markdown==, [highlight]).
 * - Applies database-backed user highlights with custom colors & metadata.
 */
export function formatArticleContentHtml(
  articleContent?: string | null,
  highlights: HighlightType[] = []
): { __html: string } {
  if (!articleContent || articleContent.trim() === "") {
    return {
      __html: "<p class='text-muted-foreground italic'>No content available for this article.</p>",
    };
  }

  let html = articleContent.trim();

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

      // Break long unformatted text blocks (>450 chars) by sentence endings so text never feels like a giant wall
      if (p.length > 450) {
        const sentences = p.split(/(?<=[.!?])\s+/);
        let currentChunk = "";

        sentences.forEach((sentence) => {
          if ((currentChunk + " " + sentence).length > 380 && currentChunk.length > 0) {
            formattedParagraphs.push(
              `<p class="leading-relaxed mb-6 text-[#1A1A1A] dark:text-foreground">${currentChunk.trim()}</p>`
            );
            currentChunk = sentence;
          } else {
            currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
          }
        });

        if (currentChunk.trim().length > 0) {
          formattedParagraphs.push(
            `<p class="leading-relaxed mb-6 text-[#1A1A1A] dark:text-foreground">${currentChunk.trim()}</p>`
          );
        }
      } else {
        const formattedPara = p.replace(/\n/g, "<br />");
        formattedParagraphs.push(
          `<p class="leading-relaxed mb-6 text-[#1A1A1A] dark:text-foreground">${formattedPara}</p>`
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

  return { __html: html };
}
