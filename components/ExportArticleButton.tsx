"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { logger } from '@/lib/logger'

interface ExportArticleButtonProps {
  articleId: string
  articleTitle: string
}

export function ExportArticleButton({ articleId, articleTitle }: Readonly<ExportArticleButtonProps>) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    try {
      setExporting(true)
      const res = await fetch(`/api/articles/${articleId}/export`)
      
      if (!res.ok) {
        throw new Error("Failed to export article")
      }
      
      const blob = await res.blob()
      const url = globalThis.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${articleTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_export.md`
      document.body.appendChild(a)
      a.click()
      globalThis.URL.revokeObjectURL(url)
      a.remove()
      
      toast.success("Article exported to Markdown!")
    } catch (error) {
      logger.error(error)
      toast.error("An error occurred during export")
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-2 font-sans text-xs" onClick={handleExport} disabled={exporting}>
      <Download className="w-3.5 h-3.5" /> {exporting ? "Exporting..." : "Export MD"}
    </Button>
  )
}
