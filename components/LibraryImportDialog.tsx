"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Library, Loader2, Plus, Check } from "lucide-react"
import { logger } from '@/lib/logger'
import type { ArticleProps } from "@/components/ArticleCard"

export function LibraryImportDialog({ roomId }: { roomId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [articles, setArticles] = useState<ArticleProps['article'][]>([])
  const [loading, setLoading] = useState(true)
  const [importingId, setImportingId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (articles.length === 0) setLoading(true)
      fetch('/api/articles/library')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setArticles(data)
          }
        })
        .catch(err => logger.error("Failed to fetch library articles", err))
        .finally(() => setLoading(false))
    }
  }, [open])

  const handleImport = async (articleId: string) => {
    setImportingId(articleId)
    
    try {
      const res = await fetch(`/api/articles/${articleId}/room`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId })
      })

      if (!res.ok) {
        throw new Error("Failed to assign article to room")
      }

      toast.success("Document added to room")
      // Remove it from the local list immediately so they can keep adding others
      setArticles(prev => prev.filter(a => a.id !== articleId))
      router.refresh()
    } catch (error) {
      logger.error(error)
      toast.error("Failed to add document")
    } finally {
      setImportingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="gap-2 rounded-none cursor-pointer">
          <Library className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add from Library</span>
        </Button>
      } />
      <DialogContent className="sm:max-w-md bg-card border-border p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="font-heading font-bold text-foreground">Add from Library</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select a document from your general library to move into this room.
          </p>
        </DialogHeader>
        
        <div className="border-t border-border">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Library className="w-8 h-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-foreground">Your library is empty</p>
              <p className="text-xs text-muted-foreground mt-1">All your documents are already in rooms, or you haven't saved any yet.</p>
            </div>
          ) : (
            <div className="h-[300px] overflow-y-auto overflow-x-hidden w-full">
              <div className="flex flex-col w-full">
                {articles.map(article => (
                  <div key={article.id} className="flex items-center justify-between py-4 pl-4 pr-6 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors w-full">
                    <div className="flex flex-col gap-1 pr-4 overflow-hidden flex-1 min-w-0 w-full">
                      <span className="text-sm font-medium text-foreground truncate block w-full">{article.title}</span>
                      <span className="text-xs text-muted-foreground truncate block w-full">{article.source_url}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="shrink-0 rounded-none h-8 ml-2"
                      onClick={() => handleImport(article.id)}
                      disabled={importingId !== null}
                    >
                      {importingId === article.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
