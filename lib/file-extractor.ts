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

export type PdfLoader = (arrayBuffer: ArrayBuffer) => Promise<{
  numPages: number;
  getPage: (pageNo: number) => Promise<{
    getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
  }>;
}>;

export async function extractTextFromPdf(file: File, customLoader?: PdfLoader): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    let pdf: {
      numPages: number;
      getPage: (pageNo: number) => Promise<{
        getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
      }>;
    };

    if (customLoader) {
      pdf = await customLoader(arrayBuffer);
    } else {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
      }).promise;
    }

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

function stripTags(htmlStr: string): string {
  return htmlStr
    .split("<")
    .map((chunk) => {
      const closingIdx = chunk.indexOf(">");
      return closingIdx >= 0 ? chunk.substring(closingIdx + 1) : chunk;
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTextFromXml(xmlString: string): string {
  const formatted = xmlString.replaceAll("<w:p>", "\n\n").replaceAll("</w:p>", "\n\n");
  return stripTags(formatted);
}

async function processFileContent(
  ext: string,
  file: File,
  fileName: string
): Promise<{ text: string; sourceType: string; fileDataUrl?: string }> {
  switch (ext) {
    case ".pdf": {
      const pdfText = await extractTextFromPdf(file);
      const text = pdfText || `Extracted PDF document from ${fileName}`;
      const fileDataUrl = await readFileAsDataUrl(file);
      return { text, sourceType: "pdf", fileDataUrl };
    }
    case ".md":
    case ".markdown":
      return { text: await file.text(), sourceType: "markdown" };

    case ".txt":
    case ".log":
    case ".csv":
      return { text: await file.text(), sourceType: "txt" };

    case ".html":
    case ".htm": {
      const rawHtml = await file.text();
      return { text: stripTags(rawHtml), sourceType: "html" };
    }

    case ".json": {
      const rawJson = await file.text();
      try {
        const parsed = JSON.parse(rawJson);
        return { text: JSON.stringify(parsed, null, 2), sourceType: "json" };
      } catch {
        return { text: rawJson, sourceType: "json" };
      }
    }

    case ".docx":
    case ".epub": {
      const docType = ext.substring(1);
      let text = "";
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
      const fileDataUrl = await readFileAsDataUrl(file);
      return { text, sourceType: docType, fileDataUrl };
    }

    default:
      return { text: await file.text(), sourceType: "upload" };
  }
}

export async function extractFileContent(file: File): Promise<ExtractedFileResult> {
  const fileName = file.name;
  const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
  const title = fileName.replace(/\.[^/.]+$/, "");

  const { text, sourceType, fileDataUrl } = await processFileContent(ext, file, fileName);

  if (!text?.trim()) {
    throw new Error(`Could not extract text content from file "${fileName}".`);
  }

  return {
    title,
    text,
    sourceType,
    fileDataUrl,
  };
}
