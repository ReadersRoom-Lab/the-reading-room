if (typeof globalThis.DOMMatrix === "undefined") {
  // @ts-expect-error Polyfill DOMMatrix for Node environment
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
  };
}

import test from "node:test";
import assert from "node:assert";
import {
  extractFileContent,
  readFileAsDataUrl,
  extractTextFromPdf,
} from "../lib/file-extractor.js";

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

test("extractTextFromPdf returns empty string when PDF parsing fails", async () => {
  const file = new File(["invalid pdf data"], "invalid.pdf", { type: "application/pdf" });
  const res = await extractTextFromPdf(file);
  assert.strictEqual(res, "");
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

test("readFileAsDataUrl resolves when FileReader is present", async () => {
  const file = new File(["hello data"], "test.txt", { type: "text/plain" });
  const originalFR = globalThis.FileReader;

  class MockFileReaderSuccess {
    onload: (() => void) | null = null;
    onerror: ((err: Error) => void) | null = null;
    result = "data:text/plain;base64,aGVsbG8gZGF0YQ==";

    readAsDataURL() {
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 0);
    }
  }

  // @ts-expect-error Mocking FileReader for coverage
  globalThis.FileReader = MockFileReaderSuccess;

  try {
    const dataUrl = await readFileAsDataUrl(file);
    assert.strictEqual(dataUrl, "data:text/plain;base64,aGVsbG8gZGF0YQ==");
  } finally {
    globalThis.FileReader = originalFR;
  }
});

test("readFileAsDataUrl rejects on FileReader error", async () => {
  const file = new File(["bad data"], "bad.txt", { type: "text/plain" });
  const originalFR = globalThis.FileReader;

  class MockFileReaderFail {
    onload: (() => void) | null = null;
    onerror: ((err: unknown) => void) | null = null;

    readAsDataURL() {
      setTimeout(() => {
        if (this.onerror) this.onerror(new Error("Read failure"));
      }, 0);
    }
  }

  // @ts-expect-error Mocking FileReader for coverage
  globalThis.FileReader = MockFileReaderFail;

  try {
    await assert.rejects(
      async () => await readFileAsDataUrl(file),
      (err: Error) => {
        assert.ok(err.message.includes("Read failure"));
        return true;
      }
    );
  } finally {
    globalThis.FileReader = originalFR;
  }
});

test("extractFileContent handles docx XML decoding error with fallback text", async () => {
  const file = new File(["<broken xml"], "broken.epub", {
    type: "application/epub+zip",
  });
  const originalDecode = TextDecoder.prototype.decode;
  TextDecoder.prototype.decode = () => {
    throw new Error("Decode failed");
  };

  try {
    const res = await extractFileContent(file);
    assert.strictEqual(res.sourceType, "epub");
    assert.strictEqual(res.text, "Extracted content from broken.epub");
  } finally {
    TextDecoder.prototype.decode = originalDecode;
  }
});

test("extractTextFromPdf parses multi-page text using customLoader", async () => {
  const mockLoader = async () => ({
    numPages: 2,
    getPage: async (pageNo: number) => ({
      getTextContent: async () => ({
        items: [{ str: `Page ${pageNo} heading` }],
      }),
    }),
  });

  const file = new File(["fake pdf bytes"], "test.pdf", { type: "application/pdf" });
  const text = await extractTextFromPdf(file, mockLoader);
  assert.ok(text.includes("Page 1 heading"));
  assert.ok(text.includes("Page 2 heading"));
});
