"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageLightboxModalProps {
  readonly src: string;
  readonly alt?: string;
  readonly onClose: () => void;
}

export function ImageLightboxModal({ src, alt, onClose }: ImageLightboxModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Preview"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95"
    >
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default border-0 p-0 bg-transparent"
        onClick={onClose}
        aria-label="Close modal background"
      />

      <div className="absolute top-4 right-4 z-50">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg cursor-pointer"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col items-center justify-center relative z-10 pointer-events-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || "Article graphic"}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
        {alt && (
          <p className="mt-4 text-xs font-sans text-white/80 italic text-center max-w-xl">{alt}</p>
        )}
      </div>
    </div>
  );
}
