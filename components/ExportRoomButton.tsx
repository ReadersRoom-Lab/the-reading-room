"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface ExportRoomButtonProps {
  roomId: string;
  roomName: string;
}

export function ExportRoomButton({ roomId, roomName }: Readonly<ExportRoomButtonProps>) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await fetch(`/api/rooms/${roomId}/export`);

      if (!res.ok) {
        throw new Error("Failed to export room");
      }

      const blob = await res.blob();
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${roomName.replace(/\s+/g, "_").toLowerCase()}_export.md`;
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      a.remove();

      toast.success("Room exported successfully!");
    } catch (error) {
      logger.error(error);
      toast.error("An error occurred during export");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-none cursor-pointer"
      onClick={handleExport}
      disabled={exporting}
      title={exporting ? "Exporting..." : "Export room as Markdown"}
      aria-label={exporting ? "Exporting..." : "Export room"}
    >
      {exporting ? (
        <span className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full inline-block" />
      ) : (
        <Download className="w-4 h-4" />
      )}
    </Button>
  );
}
