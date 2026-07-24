"use client";

import { useMemo, useState } from "react";
import { List, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

function stripTags(htmlStr: string): string {
  return htmlStr
    .split("<")
    .map((chunk) => {
      const idx = chunk.indexOf(">");
      return idx >= 0 ? chunk.substring(idx + 1) : chunk;
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parses headings (h1, h2, h3) from HTML string */
export function extractHeadings(htmlContent: string): {
  headings: TocItem[];
  processedHtml: string;
} {
  if (!htmlContent) {
    return { headings: [], processedHtml: "" };
  }

  if (typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${htmlContent}</div>`, "text/html");
      const headingElements = Array.from(doc.querySelectorAll("h1, h2, h3"));

      const headings: TocItem[] = [];

      headingElements.forEach((el, index) => {
        const text = el.textContent?.trim() || "";
        if (!text) return;

        let id = el.getAttribute("id");
        if (!id) {
          id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          el.setAttribute("id", id);
        }

        const level = Number.parseInt(el.tagName.replace("H", ""), 10) || 2;
        headings.push({ id, text, level });
      });

      const processedHtml = doc.body.firstElementChild
        ? doc.body.firstElementChild.innerHTML
        : htmlContent;
      return { headings, processedHtml };
    } catch (err) {
      console.warn("Failed to parse Table of Contents headings:", err);
    }
  }

  // Fallback parsing for non-browser / unit-test environments
  const headings: TocItem[] = [];
  const regex = /<h([1-3])\b([^>]*)>([\s\S]*?)<\/h[1-3]>/gi;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = regex.exec(htmlContent)) !== null) {
    const level = Number.parseInt(match[1], 10);
    const attrs = match[2];
    const rawText = stripTags(match[3]);
    if (!rawText) continue;

    const idMatch = /id=["']([^"']+)["']/i.exec(attrs);
    const id = idMatch
      ? idMatch[1]
      : `heading-${index}-${rawText.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    headings.push({ id, text: rawText, level });
    index++;
  }

  return { headings, processedHtml: htmlContent };
}

interface ReaderTableOfContentsProps {
  readonly htmlContent: string;
  readonly scrollRef: React.RefObject<HTMLDivElement | null>;
}

function getHeadingStyleClass(level: number): string {
  if (level === 1) return "font-heading font-bold text-sm text-[#1A1A1A]";
  if (level === 2) return "font-sans text-xs font-medium text-[#333] pl-4";
  return "font-sans text-[11px] text-[#52525B] pl-7";
}

export function ReaderTableOfContents({ htmlContent, scrollRef }: ReaderTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { headings } = useMemo(() => {
    return extractHeadings(htmlContent);
  }, [htmlContent]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    setIsOpen(false);
    const container = scrollRef.current;
    if (!container) return;

    const targetEl = container.querySelector(`#${id}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* TOC Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 px-2.5 text-xs font-semibold uppercase tracking-wider gap-1.5 border-[#E5E5E5] bg-white text-[#1A1A1A] hover:bg-[#F4F3F3] rounded-none shadow-sm"
        title="Table of Contents"
      >
        <List className="w-3.5 h-3.5 text-[#52525B]" />
        <span className="hidden sm:inline">Outline</span>
      </Button>

      {/* Slide-over Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="bg-[#FAF9F5] border-l-2 border-[#1A1A1A] w-full max-w-sm h-full flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-300 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] mb-6">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-[#1A1A1A]" />
                <h3 className="font-heading font-bold text-base text-[#1A1A1A]">Article Outline</h3>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#52525B] hover:text-[#1A1A1A] transition-colors rounded-none"
                aria-label="Close Table of Contents"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Headings List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
              {headings.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => scrollToHeading(h.id)}
                  className={`w-full text-left py-2 px-3 hover:bg-[#E5E5E5]/50 transition-colors flex items-center justify-between group rounded-none cursor-pointer ${getHeadingStyleClass(
                    h.level
                  )}`}
                >
                  <span className="truncate">{h.text}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#BDBDBD] group-hover:text-[#1A1A1A] transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
