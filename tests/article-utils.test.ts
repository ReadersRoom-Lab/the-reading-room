import test from "node:test";
import assert from "node:assert/strict";
import { getArticleSourceDomain } from "../lib/article-utils";

test("getArticleSourceDomain extracts domain from standard HTTP/HTTPS URLs", () => {
  assert.equal(
    getArticleSourceDomain("https://aeon.co/essays/for-iris-murdoch-morality-is-about-love"),
    "aeon.co"
  );
  assert.equal(
    getArticleSourceDomain("https://www.nytimes.com/2026/07/25/technology/ai.html"),
    "nytimes.com"
  );
});

test("getArticleSourceDomain extracts domain from scheme-less URLs", () => {
  assert.equal(getArticleSourceDomain("scroll.in/article/1000/kerala-growth"), "scroll.in");
});

test("getArticleSourceDomain handles upload:// scheme gracefully without UNKNOWN", () => {
  assert.equal(
    getArticleSourceDomain(
      "upload://How did Kerala go from poor to prosperous among India's states_ Scroll.in.pdf"
    ),
    "scroll.in"
  );
  assert.equal(
    getArticleSourceDomain(
      "upload://For Sergiu Klainerman, maths is a fact to be divined _ Aeon Essays.pdf"
    ),
    "Aeon Essays"
  );
  assert.equal(getArticleSourceDomain("upload://document.pdf", "pdf"), "PDF");
  assert.equal(getArticleSourceDomain("upload://book.epub", "epub"), "EPUB");
});

test("getArticleSourceDomain fallback handles empty or malformed input without returning Unknown", () => {
  assert.equal(getArticleSourceDomain("", "url", ""), "Article");
  assert.equal(getArticleSourceDomain("invalid string with spaces", "pdf", ""), "PDF");
  assert.equal(getArticleSourceDomain(null, null, null), "Article");
});
