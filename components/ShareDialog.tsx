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
import { Share2, Copy, Check, Link2, BookOpen, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface ShareDialogProps {
  type: "article" | "room" | "library";
  id?: string;
  title?: string;
  defaultShareMode?: "reader" | "native";
  compact?: boolean;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ShareDialog({
  type,
  id,
  title = "Item",
  defaultShareMode = "reader",
  compact,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: Readonly<ShareDialogProps>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (setControlledOpen ?? (() => {})) : setInternalOpen;

  const [shareMode, setShareMode] = useState<"reader" | "native">(defaultShareMode);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      let endpoint = "/api/library/share";
      if (type === "article" && id) {
        endpoint = `/api/articles/${id}/share`;
      } else if (type === "room" && id) {
        endpoint = `/api/rooms/${id}/share`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: shareMode }),
      });

      if (!res.ok) throw new Error("Failed to generate share link");

      const data = await res.json();
      const origin = globalThis.location?.origin || "";
      const fullUrl = `${origin}${data.share_url}`;
      setShareUrl(fullUrl);

      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      toast.success("Share link copied to clipboard!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate share link");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeLink = async () => {
    try {
      setLoading(true);
      let endpoint = "/api/library/share";
      if (type === "article" && id) {
        endpoint = `/api/articles/${id}/share`;
      } else if (type === "room" && id) {
        endpoint = `/api/rooms/${id}/share`;
      }

      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revoke link");

      setShareUrl(null);
      toast.success("Share link revoked.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke link");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeCopy = async () => {
    if (type !== "article" || !id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/articles/${id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to duplicate article");

      toast.success("Created a copy in your library!");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate article");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = async () => {
    if (type !== "article" || !id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/articles/${id}/export`);
      if (!res.ok) throw new Error("Failed to fetch markdown content");

      const text = await res.text();
      await navigator.clipboard.writeText(text);
      toast.success("Markdown copied to clipboard!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to copy content");
    } finally {
      setLoading(false);
    }
  };

  let buttonText = "Generate & Copy Share Link";
  if (copied) {
    buttonText = "Link Copied!";
  } else if (shareUrl) {
    buttonText = "Copy Link Again";
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger
          render={
            compact ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs rounded-none cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                className="gap-2 border-[#E5E5E5] bg-white hover:bg-[#F9F7F2] text-[#1A1A1A] rounded-none cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#1A1A1A]" />
                <span>Share {type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </Button>
            )
          }
        />
      )}

      <DialogContent
        className="sm:max-w-md bg-white border border-[#E5E5E5] rounded-none font-sans"
        onClick={(e) => {
          e.stopPropagation();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-lg text-[#1A1A1A] flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#1A1A1A]" /> Share{" "}
            {type === "article" ? title : type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#52525B]">
            Share via a public link with custom reader/native options or create a copy in your
            workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          {/* Share Mode Selection for Articles */}
          {type === "article" && (
            <div>
              <span className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
                Recipient Default View Mode
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShareMode("reader")}
                  className={`p-3 border text-left text-xs font-medium transition-all ${
                    shareMode === "reader"
                      ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                      : "border-[#E5E5E5] bg-white text-[#52525B] hover:text-[#1A1A1A]"
                  }`}
                >
                  <BookOpen className="w-4 h-4 mb-1" />
                  <span className="font-bold block">Reader Version</span>
                  <span className="text-[10px] opacity-80">Clean typography & highlight notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShareMode("native")}
                  className={`p-3 border text-left text-xs font-medium transition-all ${
                    shareMode === "native"
                      ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                      : "border-[#E5E5E5] bg-white text-[#52525B] hover:text-[#1A1A1A]"
                  }`}
                >
                  <FileText className="w-4 h-4 mb-1" />
                  <span className="font-bold block">Native Version</span>
                  <span className="text-[10px] opacity-80">Original file layout / PDF viewer</span>
                </button>
              </div>
            </div>
          )}

          {/* Share via Link section */}
          <div className="flex flex-col gap-2">
            <span className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              Shareable Link
            </span>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateLink}
                disabled={loading}
                className="flex-1 bg-[#1A1A1A] text-white hover:bg-black font-semibold rounded-none py-2 text-xs flex items-center justify-center gap-2"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                {buttonText}
              </Button>

              {shareUrl && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRevokeLink}
                  disabled={loading}
                  title="Revoke Share Link"
                  className="border-[#E5E5E5] text-red-600 hover:bg-red-50 rounded-none h-9 w-9 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {shareUrl && (
              <p className="text-[11px] text-[#52525B] font-mono break-all bg-[#F4F3F3] p-2 border border-[#E5E5E5]">
                {shareUrl}
              </p>
            )}
          </div>

          {/* Share as a Copy / Export section */}
          {type === "article" && (
            <div className="border-t border-[#E5E5E5] pt-4 flex flex-col gap-2">
              <span className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                Share / Duplicate as a Copy
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleMakeCopy}
                  disabled={loading}
                  className="border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F9F7F2] rounded-none text-xs flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Make a Copy in Library
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyMarkdown}
                  disabled={loading}
                  className="border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F9F7F2] rounded-none text-xs flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Copy Markdown
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
