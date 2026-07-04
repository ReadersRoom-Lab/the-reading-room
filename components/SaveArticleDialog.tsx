"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, FileText, Upload } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import * as pdfjsLib from "pdfjs-dist"

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

export function SaveArticleDialog({ defaultRoomId, compact }: { defaultRoomId?: string, compact?: boolean } = {}) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    
    if (!url && !file) {
      toast.error("Please enter a valid URL, DOI, arXiv ID, or select a PDF")
      return
    }

    try {
      setLoading(true)
      
      let res;
      if (file) {
        // Extract text on the client side using pdfjs-dist
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true
        }).promise
        
        let extractedText = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map((item: any) => item.str).join(' ')
          extractedText += pageText + '\n\n'
        }

        if (!extractedText.trim()) {
          throw new Error('Could not extract any text from this PDF. It appears to be a scanned document or an image-based PDF, which we cannot read without OCR software.')
        }

        const title = file.name || 'Untitled PDF'

        res = await fetch("/api/articles/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            title: title, 
            source_url: `upload://${file.name}`,
            source_type: 'pdf',
            text: extractedText,
            roomId: defaultRoomId
          }),
        })
      } else {
        res = await fetch("/api/articles/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, roomId: defaultRoomId }),
        })
      }

      if (!res.ok) {
        let errorMessage = "Failed to save article"
        const contentType = res.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json()
          errorMessage = data.error || errorMessage
        } else {
          if (res.status === 504) {
            errorMessage = "The request timed out. The page might be too large or slow to respond."
          } else if (res.status >= 500) {
            errorMessage = "An unexpected server error occurred."
          } else {
            errorMessage = `Failed to save article (${res.status})`
          }
        }
        throw new Error(errorMessage)
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
      {compact ? (
        <DialogTrigger render={
          <Button variant="outline" size="sm" className="gap-2 rounded-none cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Document</span>
          </Button>
        } />
      ) : (
        <DialogTrigger className="w-full flex justify-start gap-2 bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#333] h-10 px-4 py-2 inline-flex items-center whitespace-nowrap text-sm font-medium font-sans transition-colors">
          <Plus className="w-4 h-4" />
          <span>Save Document</span>
        </DialogTrigger>
      )}
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
