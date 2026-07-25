const FILE_EXTENSIONS = new Set([
  "pdf",
  "epub",
  "txt",
  "html",
  "htm",
  "doc",
  "docx",
  "md",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "zip",
]);

/**
 * Resolves a human-readable domain, publication name, or file type badge string
 * for an article given its source URL, source type, and title.
 */
export function getArticleSourceDomain(
  sourceUrl?: string | null,
  sourceType?: string | null,
  title?: string | null
): string {
  const url = (sourceUrl || "").trim();
  const rawType = (sourceType || "").trim().toLowerCase();
  const cleanTitle = (title || "").trim();

  // 1. Check for standard HTTP/HTTPS URLs
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./i, "");
      if (host) return host;
    } catch {
      // Fall through if URL parsing fails
    }
  }

  // 2. Check for scheme-less domain URLs (e.g. "aeon.co/essays/...")
  if (
    /^[a-z0-9-]+\.[a-z]{2,}/i.test(url) &&
    !url.startsWith("upload://") &&
    !url.startsWith("file://")
  ) {
    try {
      const parsed = new URL(`https://${url}`);
      const host = parsed.hostname.replace(/^www\./i, "");
      if (host) return host;
    } catch {
      // Fall through
    }
  }

  // 3. Handle scheme-based uploads (upload://, file://, blob:) or non-url source_type
  const isFileUpload =
    url.startsWith("upload://") ||
    url.startsWith("file://") ||
    url.startsWith("blob:") ||
    (rawType !== "" && rawType !== "url");

  // 4. Try extracting publisher/publication name from title or filename (e.g. "_ Aeon Essays.pdf", "| Scroll.in")
  const sourceHintMatch = `${url} ${cleanTitle}`.match(
    /(?:_|\||-)\s*([A-Za-z0-9\s.]+?)(?:\.pdf|\.epub|\.txt|\.html|\.md|$)/i
  );
  if (sourceHintMatch && sourceHintMatch[1]) {
    const hint = sourceHintMatch[1].trim();
    const hintExt = hint.split(".").pop()?.toLowerCase() || "";
    if (
      hint.length >= 2 &&
      hint.length <= 25 &&
      !FILE_EXTENSIONS.has(hintExt) &&
      !FILE_EXTENSIONS.has(hint.toLowerCase())
    ) {
      if (/\.[a-z]{2,}$/i.test(hint)) {
        return hint.toLowerCase();
      }
      return hint;
    }
  }

  // 5. Try extracting a domain name (like aeon.co, nytimes.com) from source_url or title
  const domainMatches = Array.from(
    `${url} ${cleanTitle}`.matchAll(/(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+\.[a-z]{2,})/gi)
  );
  for (const match of domainMatches) {
    if (match && match[1]) {
      const candidate = match[1].toLowerCase();
      const ext = candidate.split(".").pop() || "";
      if (!FILE_EXTENSIONS.has(ext)) {
        return candidate;
      }
    }
  }

  // 6. If it's a file upload, check for file extension or use sourceType
  if (isFileUpload) {
    const extMatch = url.match(/\.([a-z0-9]+)$/i);
    if (
      extMatch &&
      extMatch[1] &&
      extMatch[1].length <= 5 &&
      FILE_EXTENSIONS.has(extMatch[1].toLowerCase())
    ) {
      return extMatch[1].toUpperCase();
    }
    if (rawType && rawType !== "url") {
      return rawType.toUpperCase();
    }
    return "PDF";
  }

  return "Article";
}
