import { useEffect, useState } from "react"
import { Bookmark, Edit3, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logger } from '@/lib/logger'

interface DictionaryPopoverProps {
  word: string
  rect: DOMRect
  onClose: () => void
  onSave: (word: string, definition: string) => void
  onHighlight: () => void
}

export function DictionaryPopover({ word, rect, onClose, onSave, onHighlight }: Readonly<DictionaryPopoverProps>) {
  const [data, setData] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDef = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/dictionary?word=${encodeURIComponent(word)}`)
        if (res.ok) {
          setData(await res.json())
        } else {
          setData({ word, error: 'Definition not found' })
        }
      } catch(e) {
        logger.error(e)
        setData({ word, error: 'Error fetching definition' })
      } finally {
        setLoading(false)
      }
    }
    fetchDef()
  }, [word])

  if (!rect) return null

  const windowWidth = globalThis.window === undefined ? 1000 : globalThis.window.innerWidth
  const leftPos = Math.max(10, Math.min(rect.left + (rect.width / 2) - 160, windowWidth - 330))

  return (
    <div 
      className="fixed z-50 bg-[#FCFBF8] border border-border shadow-lg rounded-md w-[320px] font-sans flex flex-col"
      style={{
        top: rect.top > 250 ? rect.top - 200 : rect.bottom + 10,
        left: leftPos,
      }}
    >
      <div className="flex justify-between items-start p-4 border-b border-border relative">
        <div className="flex flex-col">
          <h4 className="font-heading font-bold text-lg text-[#1a1a1a]">{data?.word || word}</h4>
          {data?.phonetic && <span className="text-xs text-muted-foreground">{data.phonetic} · {data.partOfSpeech}</span>}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && data?.error && (
          <p className="text-sm text-muted-foreground italic">{data.error}</p>
        )}
        {!loading && data && !data.error && (
          <>
            <p className="text-sm text-[#333] leading-relaxed font-source-serif">
              {data.definition}
            </p>
            {data.example && (
              <p className="text-xs text-muted-foreground italic font-source-serif">
                &quot;{data.example}&quot;
              </p>
            )}
            {data.etymology && (
              <div className="bg-muted/50 p-2 rounded-sm mt-2">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Etymology</p>
                <p className="text-xs text-muted-foreground">{data.etymology}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-2 border-t border-border">
        <Button 
          variant="default" 
          className="rounded-none rounded-bl-md border-r border-[#E5E5E5] h-10 gap-2 bg-[#1a1a1a] text-white hover:bg-[#444444] hover:text-white transition-colors"
          onClick={() => onSave(data?.word || word, data?.definition || '')}
        >
          <Bookmark className="w-4 h-4" /> Save to Vault
        </Button>
        <Button 
          variant="ghost" 
          className="rounded-none rounded-br-md h-10 gap-2 text-[#1a1a1a] hover:bg-muted"
          onClick={onHighlight}
        >
          <Edit3 className="w-4 h-4" /> Highlight
        </Button>
      </div>
    </div>
  )
}
