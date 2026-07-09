import test from "node:test";
import assert from "node:assert/strict";
import { chunkText, generateEmbeddings } from "../lib/embeddings";

test("chunkText handles empty text", () => {
  const result = chunkText("");
  assert.deepEqual(result, []);
});

test("chunkText splits text that fits in one chunk", () => {
  const result = chunkText("test text", 100);
  assert.deepEqual(result, ["test text"]);
});

test("chunkText splits multiple paragraphs by chunk size", () => {
  const text = "paragraph 1\n\nparagraph 2\n\nparagraph 3";
  const result = chunkText(text, 15);
  assert.equal(result.length, 3);
  assert.equal(result[0], "paragraph 1");
  assert.equal(result[1], "paragraph 2");
  assert.equal(result[2], "paragraph 3");
});

test("chunkText preserves a long single paragraph as one chunk", () => {
  const long = "word ".repeat(300);
  const result = chunkText(long, 2000);
  assert.equal(result.length, 1);
  assert.ok(result[0].startsWith("word"));
});

test("generateEmbeddings returns empty array for empty input", async () => {
  const result = await generateEmbeddings([]);
  assert.deepEqual(result, []);
});
