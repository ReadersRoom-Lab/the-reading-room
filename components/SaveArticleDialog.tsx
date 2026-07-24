"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Upload, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { extractFileContent } from "@/lib/file-extractor";

interface FileQueueItem {
  id: string;
  file: File;
  status: "pending" | "processing" | "success" | "error";
  error?: string;
}

export function SaveArticleDialog({
  defaultRoomId,
  compact,
}: { defaultRoomId?: string; compact?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [fileQueue, setFileQueue] = useState<FileQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

  const handleFileSelection = (files: FileList | File[]) => {
    const validFiles: FileQueueItem[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`"${file.name}" exceeds maximum size limit of 50MB`);
        return;
      }
      validFiles.push({
        id: `${file.name}-${crypto.randomUUID()}`,
        file,
        status: "pending",
      });
    });

    if (validFiles.length > 0) {
      setFileQueue((prev) => [...prev, ...validFiles]);
      setUrl(""); // Clear URL input when files are added
    }
  };

  const removeQueueItem = (id: string) => {
    setFileQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!url && fileQueue.length === 0) {
      toast.error("Please enter a URL, DOI, arXiv ID, or select one or more files.");
      return;
    }

    try {
      setLoading(true);

      // Single URL processing
      if (url.trim()) {
        const res = await fetch("/api/articles/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim(), roomId: defaultRoomId }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed to save article (${res.status})`);
        }

        toast.success("Document saved successfully!");
        setOpen(false);
        setUrl("");
        setFileQueue([]);
        router.refresh();
        return;
      }

      // Multi-file batch processing
      const extractedBatch: Array<{
        title: string;
        text: string;
        source_type: string;
        source_url: string;
        file_url?: string;
      }> = [];

      // Update status to processing
      setFileQueue((prev) => prev.map((item) => ({ ...item, status: "processing" })));

      for (const item of fileQueue) {
        try {
          const extracted = await extractFileContent(item.file);
          extractedBatch.push({
            title: extracted.title,
            text: extracted.text,
            source_type: extracted.sourceType,
            source_url: `upload://${item.file.name}`,
            file_url: extracted.fileDataUrl,
          });
        } catch (extractErr) {
          setFileQueue((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    status: "error",
                    error:
                      extractErr instanceof Error
                        ? extractErr.message
                        : "Failed to extract text content",
                  }
                : i
            )
          );
        }
      }

      if (extractedBatch.length === 0) {
        throw new Error("Could not extract readable text from any of the selected files.");
      }

      const res = await fetch("/api/articles/batch-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: extractedBatch,
          roomId: defaultRoomId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Batch upload failed.");
      }

      const { results } = await res.json();
      const successCount = results.filter((r: { success: boolean }) => r.success).length;

      const resultMap = new Map<string, { success: boolean; error?: string }>(
        results.map((r: { title: string; success: boolean; error?: string }) => [r.title, r])
      );

      const updatedQueue = fileQueue.map((item) => {
        const fileTitle = item.file.name.replace(/\.[^/.]+$/, "");
        const match = resultMap.get(fileTitle);
        if (match && !match.success) {
          return { ...item, status: "error" as const, error: match.error || "Failed to save" };
        }
        return { ...item, status: "success" as const };
      });

      setFileQueue(updatedQueue);

      toast.success(`Successfully saved ${successCount} of ${fileQueue.length} document(s)!`);

      setTimeout(() => {
        setOpen(false);
        setFileQueue([]);
        setUrl("");
        router.refresh();
      }, 1200);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "An error occurred during save");
    } finally {
      setLoading(false);
    }
  };

  let submitButtonLabel = "Save Document";
  if (loading) {
    submitButtonLabel =
      fileQueue.length > 0 ? `Processing ${fileQueue.length} file(s)...` : "Processing...";
  } else if (fileQueue.length > 1) {
    submitButtonLabel = `Upload & Save ${fileQueue.length} Files`;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setFileQueue([]);
          setUrl("");
        }
      }}
    >
      {compact ? (
        <DialogTrigger
          render={
            <Button variant="outline" size="sm" className="gap-2 rounded-none cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save Documents</span>
            </Button>
          }
        />
      ) : (
        <DialogTrigger
          render={
            <Button className="w-full flex justify-start gap-2 bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#333] h-10 px-4 py-2 text-sm font-medium font-sans rounded-none transition-colors cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Save Documents</span>
            </Button>
          }
        />
      )}
      <DialogContent className="sm:max-w-lg bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-foreground">
            Save Documents & Articles
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Paste a URL, DOI, arXiv ID, or upload multiple files at once (.pdf, .txt, .md, .epub,
            .docx, .html, .json).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-4">
            {/* URL Input */}
            <div>
              <label
                htmlFor="save-url-input"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
              >
                Web URL / DOI / arXiv ID
              </label>
              <Input
                id="save-url-input"
                placeholder="https://example.com/article or DOI (10.xxx)"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (e.target.value) setFileQueue([]);
                }}
                disabled={loading || fileQueue.length > 0}
                autoComplete="off"
                className="bg-background border-border rounded-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-border" />
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                OR MULTI-FILE UPLOAD
              </span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Drag & Drop Multi-file selector */}
            <button
              type="button"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFileSelection(e.dataTransfer.files);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                fileQueue.length > 0
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.txt,.md,.markdown,.epub,.docx,.html,.htm,.json"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelection(e.target.files);
                  }
                }}
              />
              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">
                Drop files here or <span className="text-primary underline">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Supports PDF, TXT, Markdown, EPUB, DOCX, HTML, JSON (up to 50MB each)
              </p>
            </button>

            {/* Selected File Queue List */}
            {fileQueue.length > 0 && (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto border border-border p-2 bg-muted/20">
                <div className="flex justify-between items-center px-1 text-xs font-semibold text-muted-foreground">
                  <span>
                    Queue ({fileQueue.length} file{fileQueue.length > 1 ? "s" : ""})
                  </span>
                  {!loading && (
                    <button
                      type="button"
                      onClick={() => setFileQueue([])}
                      className="text-[10px] text-destructive hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {fileQueue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-card border border-border text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate font-medium text-foreground">{item.file.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        ({(item.file.size / (1024 * 1024)).toFixed(1)}MB)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === "processing" && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" /> Processing
                        </span>
                      )}
                      {item.status === "success" && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Saved
                        </span>
                      )}
                      {item.status === "error" && (
                        <span
                          className="flex items-center gap-1 text-[10px] text-destructive font-medium"
                          title={item.error}
                        >
                          <AlertCircle className="w-3 h-3" /> Failed
                        </span>
                      )}

                      {!loading && (
                        <button
                          type="button"
                          onClick={() => removeQueueItem(item.id)}
                          className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || (!url.trim() && fileQueue.length === 0)}
            className="font-semibold bg-primary text-primary-foreground rounded-none mt-2"
          >
            {submitButtonLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
