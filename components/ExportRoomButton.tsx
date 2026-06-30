"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ExportRoomButtonProps {
  roomId: string
  roomName: string
}

export function ExportRoomButton({ roomId, roomName }: ExportRoomButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    try {
      setExporting(true)
      const res = await fetch(`/api/rooms/${roomId}/export`)
      
      if (!res.ok) {
        throw new Error("Failed to export room")
      }
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${roomName.replace(/\s+/g, "_").toLowerCase()}_export.md`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success("Room exported successfully!")
    } catch (error) {
      console.error(error)
      toast.error("An error occurred during export")
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleExport} disabled={exporting}>
      <Download className="w-4 h-4" /> {exporting ? "Exporting..." : "Export"}
    </Button>
  )
}
