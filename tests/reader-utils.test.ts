import test from "node:test";
import assert from "node:assert/strict";
import { formatArticleContentHtml } from "../lib/reader-utils";

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
  const input = "# Main Title\n\n## Sub Section\n\n> This is a quote\n\n**Bold Statement**";
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
    result.__html.includes(
      '<blockquote class="border-l-4 border-primary/50 pl-4 py-1 my-6 italic text-[#52525B] dark:text-muted-foreground bg-muted/20">This is a quote</blockquote>'
    )
  );
  assert.ok(result.__html.includes("<strong>Bold Statement</strong>"));
});

test("formatArticleContentHtml formats pre-existing markdown and HTML highlights", () => {
  const markdownInput = "This document has ==pre-existing highlight== inside.";
  const mdResult = formatArticleContentHtml(markdownInput);
  assert.ok(
    mdResult.__html.includes(
      '<mark class="bg-[#FCD116]/40 dark:bg-[#FCD116]/30 text-inherit rounded-sm px-1 py-0.5 font-medium">pre-existing highlight</mark>'
    )
  );

  const htmlInput =
    'This document has <mark>HTML mark tag</mark> and <span class="highlight">span highlight</span>.';
  const htmlResult = formatArticleContentHtml(htmlInput);
  assert.ok(
    htmlResult.__html.includes(
      '<mark class="bg-[#FCD116]/40 dark:bg-[#FCD116]/30 text-inherit rounded-sm px-1 py-0.5 font-medium">HTML mark tag</mark>'
    )
  );
  assert.ok(
    htmlResult.__html.includes(
      '<mark class="bg-[#FCD116]/40 dark:bg-[#FCD116]/30 text-inherit rounded-sm px-1 py-0.5 font-medium">span highlight</mark>'
    )
  );
});

test("formatArticleContentHtml applies database user highlights", () => {
  const input = "<p>Reading a book requires focus and reflection.</p>";
  const highlights = [
    {
      id: "h1",
      article_id: "a1",
      content: "focus and reflection",
      colour: "ochre",
      position_start: 10,
      position_end: 30,
    },
  ];
  const result = formatArticleContentHtml(input, highlights);
  assert.ok(result.__html.includes('data-highlight-id="h1"'));
  assert.ok(result.__html.includes("bg-[#FCD116]/40"));
});
