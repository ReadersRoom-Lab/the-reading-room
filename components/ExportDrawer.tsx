"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Code, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function ExportDrawer({ compact }: { compact?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"markdown" | "json" | "txt">("markdown");
  const [scope, setScope] = useState<"all" | "vault" | "articles">("all");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);

      const [articlesRes, vaultRes] = await Promise.all([
        fetch("/api/articles"),
        fetch("/api/vault"),
      ]);

      const articlesData = await articlesRes.json();
      const vaultData = await vaultRes.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const articles = (articlesData.articles || []) as any[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vaultEntries = (vaultData.entries || []) as any[];

      let content = "";
      let filename = `ReadrSpace_Export_${new Date().toISOString().split("T")[0]}`;

      if (format === "markdown") {
        filename += ".md";

        if (scope === "all" || scope === "articles") {
          content += `---\nexporter: ReadrSpace\ndate: ${new Date().toISOString()}\ntags: [reading, workspace, research]\n---\n\n`;
          content += `# ReadrSpace Saved Articles\n\n`;

          articles.forEach((art) => {
            content += `## ${art.title}\n`;
            content += `- **Source**: ${art.source_url}\n`;
            content += `- **Reading Progress**: ${art.reading_progress}%\n\n`;

            if (art.content) {
              content += `### Content\n\n${art.content.replace(/<[^>]*>?/gm, "")}\n\n`;
            }
            content += `---\n\n`;
          });
        }

        if (scope === "all" || scope === "vault") {
          content += `# Vocabulary & Concept Vault\n\n`;
          vaultEntries.forEach((entry) => {
            content += `### ${entry.term} *(${entry.type})*\n`;
            if (entry.pronunciation) content += `*Pronunciation: ${entry.pronunciation}*\n\n`;
            content += `**Definition**: ${entry.definition}\n\n`;
            if (entry.etymology) content += `> **Origin**: ${entry.etymology}\n\n`;
            if (entry.user_note) content += `**Personal Note**: ${entry.user_note}\n\n`;
            content += `---\n\n`;
          });
        }
      } else if (format === "json") {
        filename += ".json";
        const payload = {
          exportedAt: new Date().toISOString(),
          articles: scope === "vault" ? [] : articles,
          vault: scope === "articles" ? [] : vaultEntries,
        };
        content = JSON.stringify(payload, null, 2);
      } else {
        filename += ".txt";
        articles.forEach((art) => {
          content += `TITLE: ${art.title}\nURL: ${art.source_url}\n\n${art.content}\n\n====================\n\n`;
        });
        vaultEntries.forEach((entry) => {
          content += `TERM: ${entry.term} (${entry.type})\nDEFINITION: ${entry.definition}\n\n--------------------\n\n`;
        });
      }

      // Download file
      let mimeType = "text/plain";
      if (format === "json") {
        mimeType = "application/json";
      } else if (format === "markdown") {
        mimeType = "text/markdown";
      }

      const blob = new Blob([content], { type: mimeType });

      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);

      toast.success(`Exported as ${filename}`);
      setOpen(false);
    } catch (err) {
      console.error("Failed to export workspace:", err);
      toast.error("Failed to export workspace data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {compact ? (
          <Button variant="outline" size="sm" className="gap-2 rounded-none cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="gap-2 border-[#E5E5E5] bg-white hover:bg-[#F9F7F2] text-[#1A1A1A] rounded-none cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#1A1A1A]" />
            <span>Export Workspace</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-white border border-[#E5E5E5] rounded-none font-sans">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-lg text-[#1A1A1A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E6C79C]" /> Export Workspace Data
          </DialogTitle>
          <DialogDescription className="text-xs text-[#52525B]">
            Export your articles, highlights, and vocabulary entries to Obsidian, Notion, or
            personal Markdown archives.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-3">
          {/* Format Selector */}
          <div>
            <span className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
              Export Format
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat("markdown")}
                className={`p-3 border text-left text-xs font-medium transition-all ${
                  format === "markdown"
                    ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                    : "border-[#E5E5E5] bg-white text-[#52525B] hover:text-[#1A1A1A]"
                }`}
              >
                <FileText className="w-4 h-4 mb-1" />
                <span className="font-bold block">Obsidian / MD</span>
                <span className="text-[10px] opacity-80">YAML frontmatter</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("json")}
                className={`p-3 border text-left text-xs font-medium transition-all ${
                  format === "json"
                    ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                    : "border-[#E5E5E5] bg-white text-[#52525B] hover:text-[#1A1A1A]"
                }`}
              >
                <Code className="w-4 h-4 mb-1" />
                <span className="font-bold block">Notion / JSON</span>
                <span className="text-[10px] opacity-80">Structured JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("txt")}
                className={`p-3 border text-left text-xs font-medium transition-all ${
                  format === "txt"
                    ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                    : "border-[#E5E5E5] bg-white text-[#52525B] hover:text-[#1A1A1A]"
                }`}
              >
                <FileText className="w-4 h-4 mb-1" />
                <span className="font-bold block">Plain Text</span>
                <span className="text-[10px] opacity-80">Unformatted .txt</span>
              </button>
            </div>
          </div>

          {/* Scope Selector */}
          <div>
            <span className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
              Export Scope
            </span>
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === "all"}
                  onChange={() => setScope("all")}
                  className="accent-[#1A1A1A]"
                />
                <span className="text-[#1A1A1A] font-medium">
                  Entire Workspace (Articles & Vault)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === "vault"}
                  onChange={() => setScope("vault")}
                  className="accent-[#1A1A1A]"
                />
                <span className="text-[#1A1A1A] font-medium">Vocabulary & Concept Vault Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === "articles"}
                  onChange={() => setScope("articles")}
                  className="accent-[#1A1A1A]"
                />
                <span className="text-[#1A1A1A] font-medium">Saved Articles Only</span>
              </label>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full bg-[#1A1A1A] text-white hover:bg-black font-semibold rounded-none py-3 text-xs flex items-center justify-center gap-2"
          >
            {exporting ? (
              "Exporting..."
            ) : (
              <>
                <Download className="w-4 h-4" /> Download Export File
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
