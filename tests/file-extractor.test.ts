import test from "node:test";
import assert from "node:assert";
import { extractFileContent } from "../lib/file-extractor.js";

test("extractFileContent extracts markdown content correctly", async () => {
  const file = new File(["# Heading\n\nSample markdown content."], "test.md", {
    type: "text/markdown",
  });
  const res = await extractFileContent(file);
  assert.strictEqual(res.title, "test");
  assert.strictEqual(res.sourceType, "markdown");
  assert.strictEqual(res.text, "# Heading\n\nSample markdown content.");
});

test("extractFileContent extracts json content correctly", async () => {
  const file = new File(['{ "name": "ReadrSpace" }'], "data.json", {
    type: "application/json",
  });
  const res = await extractFileContent(file);
  assert.strictEqual(res.title, "data");
  assert.strictEqual(res.sourceType, "json");
  assert.ok(res.text.includes('"name": "ReadrSpace"'));
});

test("extractFileContent throws error on empty text file", async () => {
  const file = new File(["   "], "empty.txt", { type: "text/plain" });
  await assert.rejects(
    async () => {
      await extractFileContent(file);
    },
    {
      message: 'Could not extract text content from file "empty.txt".',
    }
  );
});
