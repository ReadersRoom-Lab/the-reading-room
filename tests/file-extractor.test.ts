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

test("extractFileContent extracts plain text files correctly", async () => {
  const file = new File(["Hello world log file"], "app.log", { type: "text/plain" });
  const res = await extractFileContent(file);
  assert.strictEqual(res.title, "app");
  assert.strictEqual(res.sourceType, "txt");
  assert.strictEqual(res.text, "Hello world log file");
});

test("extractFileContent extracts html files stripping tags", async () => {
  const file = new File(["<h1>Title</h1><p>Sample paragraph.</p>"], "index.html", {
    type: "text/html",
  });
  const res = await extractFileContent(file);
  assert.strictEqual(res.title, "index");
  assert.strictEqual(res.sourceType, "html");
  assert.strictEqual(res.text, "Title Sample paragraph.");
});

test("extractFileContent handles malformed json gracefully", async () => {
  const file = new File(["{ bad json "], "invalid.json", { type: "application/json" });
  const res = await extractFileContent(file);
  assert.strictEqual(res.title, "invalid");
  assert.strictEqual(res.sourceType, "json");
  assert.strictEqual(res.text, "{ bad json ");
});

test("extractFileContent extracts docx and epub file content using XML text extraction", async () => {
  const xmlContent = "<w:p>Paragraph 1</w:p><w:p>Paragraph 2</w:p>";
  const file = new File([xmlContent], "document.docx", {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const res = await extractFileContent(file);
  assert.strictEqual(res.title, "document");
  assert.strictEqual(res.sourceType, "docx");
  assert.strictEqual(res.text, "Paragraph 1 Paragraph 2");
  assert.ok(res.fileDataUrl?.startsWith("data:"));
});

test("extractFileContent extracts pdf files with fallback text when PDFjs is empty or unparsed", async () => {
  const file = new File(["%PDF-1.4 sample pdf content"], "sample.pdf", { type: "application/pdf" });
  const res = await extractFileContent(file);
  assert.strictEqual(res.title, "sample");
  assert.strictEqual(res.sourceType, "pdf");
  assert.ok(res.text.includes("Extracted PDF document from sample.pdf"));
  assert.ok(res.fileDataUrl?.startsWith("data:"));
});

test("extractFileContent handles empty docx XML content with fallback text", async () => {
  const file = new File([""], "empty.docx", {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const res = await extractFileContent(file);
  assert.strictEqual(res.title, "empty");
  assert.strictEqual(res.sourceType, "docx");
  assert.strictEqual(res.text, "Document content from empty.docx");
});

test("extractFileContent fallback for unknown extension plain text", async () => {
  const file = new File(["Custom file content"], "notes.custom", { type: "text/plain" });
  const res = await extractFileContent(file);
  assert.strictEqual(res.title, "notes");
  assert.strictEqual(res.sourceType, "upload");
  assert.strictEqual(res.text, "Custom file content");
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
