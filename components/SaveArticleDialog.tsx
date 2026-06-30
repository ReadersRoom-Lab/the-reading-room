"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SaveArticleDialog() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url) {
      toast.error("Please enter a valid URL")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/articles/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save article")
      }

      toast.success("Article saved successfully!")
      setOpen(false)
      setUrl("")
      
      // Refresh the current route to fetch new data
      router.refresh()
      
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full flex justify-start gap-2 mb-4 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors">
        <Plus className="w-4 h-4" />
        <span>Save Article</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-foreground">Save a new article</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Paste the URL of an article you want to read later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Input
              id="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              autoComplete="off"
              className="bg-background border-border"
            />
          </div>
          <Button type="submit" disabled={loading} className="font-semibold bg-primary text-primary-foreground">
            {loading ? "Extracting..." : "Save Article"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
