"use client";

import { X, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReaderShortcutsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function ReaderShortcutsModal({ isOpen, onClose }: ReaderShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "H", label: "Highlight selected text" },
    { key: "S", label: "Save term / Look up concept" },
    { key: "B", label: "Toggle Bionic Reading Mode" },
    { key: "T", label: "Cycle Reading Themes (Paper -> Sepia -> Dark -> OLED)" },
    { key: "N", label: "Toggle Reader vs Native view" },
    { key: "?", label: "Toggle this shortcut menu" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border shadow-2xl rounded-2xl max-w-md w-full p-6 relative animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            <h3 className="font-heading text-lg font-bold">Reader Hotkeys</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/40"
            >
              <span className="text-xs text-foreground font-medium">{sc.label}</span>
              <kbd className="font-mono text-xs font-bold px-2 py-1 bg-background border border-border rounded-md shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
