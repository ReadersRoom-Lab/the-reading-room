import test from "node:test";
import assert from "node:assert/strict";
import { formatArticleContentHtml } from "../lib/reader-utils";

test("formatArticleContentHtml handles empty, null or whitespace content", () => {
  const resultNull = formatArticleContentHtml(null);
  assert.ok(resultNull.__html.includes("No content available for this article."));

  const resultEmpty = formatArticleContentHtml("   ");
  assert.ok(resultEmpty.__html.includes("No content available for this article."));
});

test("formatArticleContentHtml formats plain text into clean paragraphs", () => {
  const input = "First paragraph text here.\n\nSecond paragraph text here.";
  const result = formatArticleContentHtml(input);
  assert.ok(
    result.__html.includes(
      '<p class="leading-relaxed mb-6 text-[#1A1A1A] dark:text-foreground">First paragraph text here.</p>'
    )
  );
  assert.ok(
    result.__html.includes(
      '<p class="leading-relaxed mb-6 text-[#1A1A1A] dark:text-foreground">Second paragraph text here.</p>'
    )
  );
});

test("formatArticleContentHtml converts Markdown headers, quotes, and bolding", () => {
  const input =
    "# Main Title\n\n## Sub Section\n\n### H3 Section\n\n#### H4 Section\n\n> This is a quote\n\n**Bold Statement** and __Another Bold__ and *Italic* and _Another Italic_";
  const result = formatArticleContentHtml(input);
  assert.ok(
    result.__html.includes('<h1 class="font-heading text-3xl font-bold mt-12 mb-6">Main Title</h1>')
  );
  assert.ok(
    result.__html.includes(
      '<h2 class="font-heading text-2xl font-bold mt-10 mb-4 pb-2 border-b border-border/50">Sub Section</h2>'
    )
  );
  assert.ok(
    result.__html.includes('<h3 class="font-heading text-xl font-bold mt-8 mb-4">H3 Section</h3>')
  );
  assert.ok(
    result.__html.includes('<h4 class="font-heading text-lg font-bold mt-6 mb-3">H4 Section</h4>')
  );
  assert.ok(
    result.__html.includes(
      '<blockquote class="border-l-4 border-primary/50 pl-4 py-1 my-6 italic text-[#52525B] dark:text-muted-foreground bg-muted/20">This is a quote</blockquote>'
    )
  );
  assert.ok(result.__html.includes("<strong>Bold Statement</strong>"));
  assert.ok(result.__html.includes("<strong>Another Bold</strong>"));
  assert.ok(result.__html.includes("<em>Italic</em>"));
  assert.ok(result.__html.includes("<em>Another Italic</em>"));
});

test("formatArticleContentHtml converts code blocks and inline code", () => {
  const input =
    "Here is inline `const x = 10;` code and block:\n\n```js\nconsole.log('hello');\n```";
  const result = formatArticleContentHtml(input);
  assert.ok(
    result.__html.includes(
      '<code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-primary">const x = 10;</code>'
    )
  );
  assert.ok(
    result.__html.includes(
      "<pre class=\"bg-muted p-4 rounded-lg overflow-x-auto my-6 font-mono text-sm border border-border/60\"><code>js\nconsole.log('hello');\n</code></pre>"
    )
  );
});

test("formatArticleContentHtml chunks long paragraphs by sentence boundaries", () => {
  const sentence1 =
    "Sentence one is long and detailed with explanations about the universe and reading.";
  const sentence2 =
    "Sentence two continues to explain how books enrich our understanding of history and science.";
  const sentence3 =
    "Sentence three expands on key cognitive insights and analytical thinking in literature.";
  const sentence4 =
    "Sentence four finishes the thought with actionable conclusions and deep learning outcomes.";
  const longParagraph = `${sentence1} ${sentence2} ${sentence3} ${sentence4}`;

  assert.ok(longParagraph.length > 300);
  const result = formatArticleContentHtml(longParagraph);
  // Should produce paragraph tags
  assert.ok(
    result.__html.includes('<p class="leading-relaxed mb-6 text-[#1A1A1A] dark:text-foreground">')
  );
});

test("formatArticleContentHtml formats pre-existing markdown, bracket, and HTML highlights", () => {
  const markdownInput = "This document has ==pre-existing highlight== inside.";
  const mdResult = formatArticleContentHtml(markdownInput);
  assert.ok(
    mdResult.__html.includes(
      '<mark class="bg-[#FCD116]/40 dark:bg-[#FCD116]/30 text-inherit rounded-sm px-1 py-0.5 font-medium">pre-existing highlight</mark>'
    )
  );

  const bracketInput =
    "Text with [[highlight: bracket highlight]] and [highlight]tag highlight[/highlight].";
  const bracketResult = formatArticleContentHtml(bracketInput);
  assert.ok(bracketResult.__html.includes("bracket highlight"));
  assert.ok(bracketResult.__html.includes("tag highlight"));

  const htmlInput =
    'This document has <mark>HTML mark tag</mark>, <mark class="custom">Custom mark</mark>, <span class="highlight">span highlight</span> and <span style="background-color: yellow">styled span</span>.';
  const htmlResult = formatArticleContentHtml(htmlInput);
  assert.ok(htmlResult.__html.includes("HTML mark tag"));
  assert.ok(htmlResult.__html.includes("Custom mark"));
  assert.ok(htmlResult.__html.includes("span highlight"));
  assert.ok(htmlResult.__html.includes("styled span"));
});

test("formatArticleContentHtml applies database user highlights with different colors and metadata", () => {
  const input = "<p>Reading focus, sage wisdom, crimson heat, and indigo depth.</p>";
  const highlights = [
    {
      id: "h1",
      article_id: "a1",
      content: "Reading focus",
      colour: "ochre",
      note: "Important note",
    },
    {
      id: "h2",
      article_id: "a1",
      content: "sage wisdom",
      colour: "sage",
      annotation_type: "concept",
    },
    {
      id: "h3",
      article_id: "a1",
      content: "crimson heat",
      colour: "crimson",
    },
    {
      id: "h4",
      article_id: "a1",
      content: "indigo depth",
      colour: "indigo",
    },
    {
      id: "h5",
      article_id: "a1",
      content: "   ",
      colour: "ochre",
    },
  ];
  const result = formatArticleContentHtml(input, highlights);
  assert.ok(result.__html.includes('data-highlight-id="h1"'));
  assert.ok(result.__html.includes('title="Note: Important note"'));
  assert.ok(result.__html.includes("bg-[#FCD116]/40"));
  assert.ok(result.__html.includes("bg-[#8DA399]/50"));
  assert.ok(result.__html.includes("bg-[#9A3B3B]/40"));
  assert.ok(result.__html.includes("bg-[#4F709C]/40"));
});
