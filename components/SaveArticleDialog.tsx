"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, FileText, Upload } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SaveArticleDialog() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url && !file) {
      toast.error("Please enter a valid URL, DOI, arXiv ID, or select a PDF")
      return
    }

    try {
      setLoading(true)
      
      let res;
      if (file) {
        const formData = new FormData()
        formData.append("file", file)
        
        res = await fetch("/api/articles/pdf", {
          method: "POST",
          body: formData,
        })
      } else {
        res = await fetch("/api/articles/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        })
      }

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save article")
      }

      toast.success("Document saved successfully!")
      setOpen(false)
      setUrl("")
      setFile(null)
      
      // Refresh the current route to fetch new data
      router.refresh()
      
    } catch (error) {
      const err = error as Error
      toast.error(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0]
      if (selected.type !== "application/pdf") {
        toast.error("Please select a valid PDF file")
        return
      }
      setFile(selected)
      setUrl("") // Clear URL if file is selected
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) { setFile(null); setUrl(""); } }}>
      <DialogTrigger className="w-full flex justify-start gap-2 mb-4 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors">
        <Plus className="w-4 h-4" />
        <span>Save Document</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-foreground">Save a new document</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Paste a URL, DOI, arXiv ID, or upload a PDF to read later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="flex flex-col gap-4 py-4">
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex flex-col gap-2 flex-1 mr-4">
                <Input
                  id="url"
                  placeholder="URL, DOI (10.xxx), or arXiv ID"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setFile(null); }}
                  disabled={loading || file !== null}
                  autoComplete="off"
                  className="bg-background border-border"
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">OR</span>
              <div className="flex-1 ml-4">
                <input 
                  type="file" 
                  accept="application/pdf"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={loading}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full flex gap-2 ${file ? 'border-primary text-primary bg-primary/10' : ''}`}
                >
                  <Upload className="w-4 h-4" />
                  {file ? 'PDF Selected' : 'Upload PDF'}
                </Button>
              </div>
            </div>
            
            {file && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span className="truncate">{file.name}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 ml-auto hover:bg-transparent" 
                  onClick={() => setFile(null)}
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </Button>
              </div>
            )}
          </div>
          <Button type="submit" disabled={loading || (!url && !file)} className="font-semibold bg-primary text-primary-foreground">
            {loading ? "Extracting..." : "Save Document"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
