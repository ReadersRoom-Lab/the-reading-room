"use client";

import { useState } from "react";
import { Download, FileText, Code, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface ExportArticleButtonProps {
  articleId: string;
  articleTitle: string;
}

export function ExportArticleButton({
  articleId,
  articleTitle,
}: Readonly<ExportArticleButtonProps>) {
  const [exporting, setExporting] = useState(false);

  const downloadFormat = async (format: "md" | "txt" | "html" | "json") => {
    try {
      setExporting(true);
      const cleanTitle = articleTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();

      if (format === "md") {
        const res = await fetch(`/api/articles/${articleId}/export`);
        if (!res.ok) throw new Error("Failed to export markdown");
        const blob = await res.blob();
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${cleanTitle}_export.md`;
        document.body.appendChild(a);
        a.click();
        globalThis.URL.revokeObjectURL(url);
        a.remove();
        toast.success("Downloaded as Markdown!");
      } else {
        const res = await fetch(`/api/articles/${articleId}`);
        if (!res.ok) throw new Error("Failed to fetch article data");
        const article = await res.json();

        let content = "";
        let mimeType = "";
        let extension = "";

        if (format === "json") {
          content = JSON.stringify(article, null, 2);
          mimeType = "application/json";
          extension = "json";
        } else if (format === "html") {
          content = `<!DOCTYPE html><html><head><title>${article.title}</title></head><body><h1>${article.title}</h1><p><em>${article.author || ""}</em></p><hr>${article.content}</body></html>`;
          mimeType = "text/html";
          extension = "html";
        } else {
          // Plain text
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = article.content || "";
          const plainText = tempDiv.textContent || tempDiv.innerText || "";
          content = `TITLE: ${article.title}\nAUTHOR: ${article.author || "Unknown"}\nSOURCE: ${article.source_url}\n\n${plainText}`;
          mimeType = "text/plain";
          extension = "txt";
        }

        const blob = new Blob([content], { type: mimeType });
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${cleanTitle}.${extension}`;
        document.body.appendChild(a);
        a.click();
        globalThis.URL.revokeObjectURL(url);
        a.remove();
        toast.success(`Downloaded as ${extension.toUpperCase()}!`);
      }
    } catch (error) {
      logger.error(error);
      toast.error("An error occurred during export");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-sans text-xs rounded-none cursor-pointer"
            disabled={exporting}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? "Downloading..." : "Download"}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48 rounded-none">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Download Format
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => downloadFormat("md")}
          className="cursor-pointer text-xs flex items-center gap-2"
        >
          <FileText className="w-3.5 h-3.5" /> Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => downloadFormat("txt")}
          className="cursor-pointer text-xs flex items-center gap-2"
        >
          <FileText className="w-3.5 h-3.5" /> Plain Text (.txt)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => downloadFormat("html")}
          className="cursor-pointer text-xs flex items-center gap-2"
        >
          <FileCode className="w-3.5 h-3.5" /> HTML (.html)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => downloadFormat("json")}
          className="cursor-pointer text-xs flex items-center gap-2"
        >
          <Code className="w-3.5 h-3.5" /> Structured JSON (.json)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
