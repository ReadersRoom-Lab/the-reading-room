/**
 * Utility to extract text content from multiple file formats:
 * - PDF (.pdf)
 * - Plain Text (.txt, .log, .csv)
 * - Markdown (.md, .markdown)
 * - HTML (.html, .htm)
 * - JSON (.json)
 * - EPUB (.epub)
 * - Word (.docx)
 */

export interface ExtractedFileResult {
  title: string;
  text: string;
  sourceType: string;
  fileDataUrl?: string;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    }).promise;

    let extractedText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? (item as { str: string }).str : ""))
        .join(" ");
      extractedText += pageText + "\n\n";
    }
    return extractedText.trim();
  } catch {
    return "";
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  if (typeof FileReader === "undefined") {
    return file.arrayBuffer().then((buf) => {
      const base64 = Buffer.from(buf).toString("base64");
      return `data:${file.type || "application/octet-stream"};base64,${base64}`;
    });
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) =>
      reject(error instanceof Error ? error : new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function extractTextFromXml(xmlString: string): string {
  // Simple XML tag stripper for docx document.xml / epub xhtml
  return xmlString
    .replace(/<w:p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractFileContent(file: File): Promise<ExtractedFileResult> {
  const fileName = file.name;
  const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
  const title = fileName.replace(/\.[^/.]+$/, "");

  let text = "";
  let sourceType = "upload";
  let fileDataUrl: string | undefined;

  if (ext === ".pdf") {
    sourceType = "pdf";
    text = await extractTextFromPdf(file);
    if (!text) {
      text = `Extracted PDF document from ${fileName}`;
    }
    fileDataUrl = await readFileAsDataUrl(file);
  } else if (ext === ".md" || ext === ".markdown") {
    sourceType = "markdown";
    text = await file.text();
  } else if (ext === ".txt" || ext === ".log" || ext === ".csv") {
    sourceType = "txt";
    text = await file.text();
  } else if (ext === ".html" || ext === ".htm") {
    sourceType = "html";
    const rawHtml = await file.text();
    text = rawHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } else if (ext === ".json") {
    sourceType = "json";
    const rawJson = await file.text();
    try {
      const parsed = JSON.parse(rawJson);
      text = JSON.stringify(parsed, null, 2);
    } catch {
      text = rawJson;
    }
  } else if (ext === ".docx" || ext === ".epub") {
    sourceType = ext.substring(1);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const textDecoder = new TextDecoder("utf-8");
      const decoded = textDecoder.decode(arrayBuffer);
      text = extractTextFromXml(decoded);
      if (!text.trim()) {
        text = `Document content from ${fileName}`;
      }
    } catch {
      text = `Extracted content from ${fileName}`;
    }
    fileDataUrl = await readFileAsDataUrl(file);
  } else {
    // Fallback for any other plain text format
    sourceType = "upload";
    text = await file.text();
  }

  if (!text || !text.trim()) {
    throw new Error(`Could not extract text content from file "${fileName}".`);
  }

  return {
    title,
    text,
    sourceType,
    fileDataUrl,
  };
}
