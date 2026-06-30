import { useState } from "react"
import { X, Bookmark, Edit3, Link as LinkIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ConceptSlideOverProps {
  term: string
  definition: string
  contextSnippet: string
  articleId: string
  roomId: string | null
  onClose: () => void
}

export function ConceptSlideOver({ term, definition, contextSnippet, articleId, roomId, onClose }: Readonly<ConceptSlideOverProps>) {
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState("")
  const router = useRouter()

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term,
          definition,
          passage: contextSnippet,
          article_id: articleId,
          room_id: roomId,
          type: 'concept',
          user_note: note
        })
      })
      if (res.ok) {
        toast.success("Saved to Vocabulary Vault")
        router.refresh()
        onClose()
      } else {
        toast.error("Failed to save to Vault")
      }
    } catch (e: unknown) {
      console.error(e)
      toast.error("Error saving to Vault")
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="absolute right-0 top-0 bottom-0 w-[400px] border-l border-border bg-[#FCFBF8] shrink-0 flex flex-col animate-in slide-in-from-right-full z-20 shadow-2xl font-sans">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <div className="p-8 flex-1 overflow-y-auto">
        <span className="inline-block px-2 py-1 border border-[#D17659] text-[#D17659] text-[9px] font-bold tracking-widest uppercase mb-4">
          Concept
        </span>
        
        <h2 className="text-4xl font-heading font-bold text-[#1a1a1a] mb-6">{term}</h2>
        
        <p className="text-[#333] font-source-serif text-lg leading-relaxed mb-10">
          {definition || "Definition not provided."}
        </p>
        
        <div className="mb-10">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-3">Context in Article</p>
          <div className="p-6 bg-white border border-border/50 text-[#1a1a1a] font-source-serif italic text-sm leading-relaxed shadow-sm">
            "{contextSnippet}"
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-3">Add Note</p>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full min-h-[100px] p-4 text-sm bg-white border border-input focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] font-source-serif"
            placeholder="Your thoughts..."
          />
        </div>
      </div>
      
      <div className="p-6 border-t border-border bg-white mt-auto flex flex-col gap-3">
        <Button 
          className="w-full h-12 text-base font-semibold bg-[#1a1a1a] text-white hover:bg-black rounded-none"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Bookmark className="w-5 h-5 mr-2" />}
          Save to Vault
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full h-10 text-sm font-semibold rounded-none border-border hover:bg-muted text-muted-foreground">
            <Edit3 className="w-4 h-4 mr-2" /> Add Note
          </Button>
          <Button variant="outline" className="w-full h-10 text-sm font-semibold rounded-none border-border hover:bg-muted text-muted-foreground">
            <LinkIcon className="w-4 h-4 mr-2" /> Link to Room
          </Button>
        </div>
      </div>
    </aside>
  )
}
