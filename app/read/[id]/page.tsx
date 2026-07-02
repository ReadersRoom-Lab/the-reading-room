"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Type, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { DictionaryPopover } from "@/components/DictionaryPopover"
import { ConceptSlideOver } from "@/components/ConceptSlideOver"
import { TextSelectionMenu } from "@/components/TextSelectionMenu"
import { EditHighlightPopover } from "@/components/EditHighlightPopover"
import { ExportArticleButton } from "@/components/ExportArticleButton"
import { logger } from '@/lib/logger'

type HighlightType = {
  id: string;
  article_id: string;
  content: string;
  colour: string;
  note?: string | null;
  annotation_type?: string | null;
  position_start: number;
  position_end: number;
}

function generateHighlightedHtml(article: Record<string, string> | null, highlights: HighlightType[]) {
  if (!article) return { __html: '' }
  let html = article.content || article.textContent || ''
  
  const sorted = [...highlights].sort((a, b) => b.content.length - a.content.length)
  
  sorted.forEach(h => {
    let colorClass = 'bg-[#FCD116]/40 dark:bg-[#FCD116]/30 text-inherit'; // Default to ochre
    if (h.colour === 'sage') colorClass = 'bg-[#8DA399]/50 dark:bg-[#8DA399]/40 text-inherit';
    else if (h.colour === 'crimson') colorClass = 'bg-[#9A3B3B]/40 dark:bg-[#9A3B3B]/30 text-inherit';
    else if (h.colour === 'indigo') colorClass = 'bg-[#4F709C]/40 dark:bg-[#4F709C]/30 text-inherit';
                       
    const safeContent = h.content.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\\$&`)
    const regex = new RegExp(`(${safeContent})`, 'g')
    
    // Check if it has a note or tag
    const hasMetadata = Boolean(h.note || h.annotation_type);
    const borderClass = hasMetadata ? 'border-b-2 border-foreground/30' : '';
    
    html = html.replace(regex, `<mark data-highlight-id="${h.id}" class="${colorClass} ${borderClass} rounded-sm px-0.5 cursor-pointer hover:opacity-80 transition-opacity">$1</mark>`)
  })
  
  return { __html: html }
}

export default function ReaderPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Settings
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif')
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base')
  const [showAnnotate, setShowAnnotate] = useState(false)
  const [activeSelection, setActiveSelection] = useState<{ text: string, rect: DOMRect, contextSnippet: string } | null>(null)
  const [showDictionary, setShowDictionary] = useState(false)
  const [concept, setConcept] = useState<{ term: string, definition: string, contextSnippet: string } | null>(null)
  const [highlights, setHighlights] = useState<HighlightType[]>([])
  const [editingHighlight, setEditingHighlight] = useState<{ highlight: HighlightType, rect: DOMRect } | null>(null)
  
  // Progress tracking
  const [progress, setProgress] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const highlightedHtml = useMemo(() => {
    return generateHighlightedHtml(article, highlights)
  }, [article, highlights])

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setArticle(data)
          setProgress(data.reading_progress || 0)
        }
        const hlRes = await fetch(`/api/highlights?articleId=${params.id}`)
        if (hlRes.ok) {
          setHighlights(await hlRes.json())
        }
      } catch (err) {
        logger.error("Error fetching article or highlights", err)
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [params.id])

  // Scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const totalScrollableDistance = scrollHeight - clientHeight
    
    if (totalScrollableDistance <= 0) return
    
    const currentProgress = Math.round((scrollTop / totalScrollableDistance) * 100)
    
    // Only update state if it increased by at least 1% to avoid excessive re-renders, 
    // or if we hit exactly 100%
    if (currentProgress > progress) {
      setProgress(Math.min(100, currentProgress))
    }
  }, [progress])

  // Save progress when unmounting
  useEffect(() => {
    return () => {
      if (article && progress > Number(article.reading_progress || 0)) {
        fetch(`/api/articles/${params.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reading_progress: progress,
            status: progress >= 95 ? 'finished' : 'in-progress'
          })
        }).catch(console.error)
      }
    }
  }, [progress, params.id, article])

  // Handle text selection
  const handleMouseUp = useCallback(() => {
    // If dictionary is open or concept is open, don't trigger new selection immediately unless they are closing it
    if (showDictionary) return;

    setTimeout(() => {
      const sel = globalThis.getSelection()
      if (sel && sel.toString().trim().length > 0) {
        const text = sel.toString().trim()
        const range = sel.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        
        let contextSnippet = ""
        const node = sel.anchorNode?.parentElement
        contextSnippet = node?.textContent || ""
        if (contextSnippet.length > 200) {
          contextSnippet = contextSnippet.substring(0, 200) + "..."
        }

        setActiveSelection({ text, rect, contextSnippet })
      } else {
        setActiveSelection(null)
      }
    }, 10)
  }, [showDictionary])

  // Attach mouseup and click event listeners dynamically
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const onMouseUpContainer = () => {
      handleMouseUp()
    }

    const onClickContainer = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'MARK' && target.hasAttribute('data-highlight-id')) {
        const id = target.getAttribute('data-highlight-id')
        const highlight = highlights.find(h => h.id === id)
        if (highlight) {
          const rect = target.getBoundingClientRect()
          setEditingHighlight({ highlight, rect })
          // Clear any active selection so TextSelectionMenu doesn't also appear
          setActiveSelection(null)
          globalThis.getSelection()?.removeAllRanges()
        }
      } else {
        // If they click somewhere else in the article, close the popover
        if (editingHighlight) {
          setEditingHighlight(null)
        }
      }
    }

    container.addEventListener('mouseup', onMouseUpContainer)
    container.addEventListener('click', onClickContainer)
    return () => {
      container.removeEventListener('mouseup', onMouseUpContainer)
      container.removeEventListener('click', onClickContainer)
    }
  }, [handleMouseUp, highlights, editingHighlight])

  // Handle save concept from dictionary popover
  const handleSaveConcept = (word: string, definition: string) => {
    setShowDictionary(false)
    setActiveSelection(null)
    setConcept({
      term: word,
      definition,
      contextSnippet: activeSelection?.contextSnippet || ""
    })
  }

  // Handle create highlight
  const handleCreateHighlight = async (color: string) => {
    if (!activeSelection || !article) return

    const newHighlight = {
      article_id: article.id,
      content: activeSelection.text,
      colour: color,
      position_start: 0, // Simplified for MVP
      position_end: 0
    }

    // Optimistic UI update
    const tempId = Date.now().toString()
    setHighlights([...highlights, { ...newHighlight, id: tempId }])
    setActiveSelection(null)
    globalThis.getSelection()?.removeAllRanges()

    try {
      const res = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHighlight)
      })
      if (res.ok) {
        const saved = await res.json()
        setHighlights(prev => prev.map(h => h.id === tempId ? saved : h))
      } else {
        // Rollback
        setHighlights(prev => prev.filter(h => h.id !== tempId))
      }
    } catch (e) {
      logger.error(e)
      setHighlights(prev => prev.filter(h => h.id !== tempId))
    }
  }

  const handleUpdateHighlight = async (id: string, data: Partial<HighlightType>) => {
    // Optimistic update
    setHighlights(prev => prev.map(h => h.id === id ? { ...h, ...data } : h))
    try {
      await fetch(`/api/highlights/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } catch (e) {
      logger.error('Failed to update highlight', e)
    }
  }

  const handleDeleteHighlight = async (id: string) => {
    // Optimistic delete
    setHighlights(prev => prev.filter(h => h.id !== id))
    setEditingHighlight(null)
    try {
      await fetch(`/api/highlights/${id}`, { method: 'DELETE' })
    } catch (e) {
      logger.error('Failed to delete highlight', e)
    }
  }


  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <Button onClick={() => router.push('/library')}>Back to Library</Button>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/95 backdrop-blur z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/library')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-heading font-semibold text-lg line-clamp-1 max-w-md">{article.title}</h1>
            {article.author && <span className="text-xs text-muted-foreground line-clamp-1 max-w-sm">{article.author}</span>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
              <Type className="w-4 h-4" />
              <span>Appearance</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Font Family</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFontFamily('serif')}>
                <span className={`font-source-serif ${fontFamily === 'serif' ? 'font-bold' : ''}`}>Serif</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontFamily('sans')}>
                <span className={`font-sans ${fontFamily === 'sans' ? 'font-bold' : ''}`}>Sans-serif</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Font Size</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFontSize('sm')}>
                <span className={fontSize === 'sm' ? 'font-bold' : ''}>Small</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize('base')}>
                <span className={fontSize === 'base' ? 'font-bold' : ''}>Medium</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize('lg')}>
                <span className={fontSize === 'lg' ? 'font-bold' : ''}>Large</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFontSize('xl')}>
                <span className={fontSize === 'xl' ? 'font-bold' : ''}>Extra Large</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ExportArticleButton articleId={article.id} articleTitle={article.title} />
        </div>
      </header>

      {/* Progress Bar */}
      <Progress value={progress} className="h-1 rounded-none bg-muted/50" />

      {/* Main Reading Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Article Content */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto px-6 py-12 scroll-smooth ${concept ? 'md:mr-[400px]' : ''}`}
        >
          <article 
            className={`
              mx-auto max-w-2xl
              prose prose-stone dark:prose-invert
              ${fontFamily === 'serif' ? 'font-source-serif' : 'font-sans'}
              ${fontSize === 'sm' ? 'prose-sm' : ''}
              ${fontSize === 'base' ? 'prose-base' : ''}
              ${fontSize === 'lg' ? 'prose-lg' : ''}
              ${fontSize === 'xl' ? 'prose-xl' : ''}
            `}
          >
            {article.cover_image && (
               // eslint-disable-next-line @next/next/no-img-element
              <img src={article.cover_image} alt="Cover" className="w-full h-64 object-cover rounded-xl mb-8" />
            )}
            <h1 className="font-heading mb-8">{article.title}</h1>
            <div dangerouslySetInnerHTML={highlightedHtml} />
          </article>
        </div>

        {/* Text Selection Menu */}
        {activeSelection && !showDictionary && !concept && (
          <TextSelectionMenu 
            rect={activeSelection.rect}
            onHighlight={handleCreateHighlight}
            onDefine={() => setShowDictionary(true)}
            onSaveConcept={() => {
              setConcept({
                term: activeSelection.text,
                definition: "",
                contextSnippet: activeSelection.contextSnippet
              })
              setActiveSelection(null)
            }}
          />
        )}

        {/* Dictionary Popover */}
        {showDictionary && activeSelection && (
          <DictionaryPopover 
            word={activeSelection.text} 
            rect={activeSelection.rect} 
            onClose={() => {
              setShowDictionary(false)
              setActiveSelection(null)
              globalThis.getSelection()?.removeAllRanges()
            }}
            onSave={handleSaveConcept}
            onHighlight={() => {
              setShowDictionary(false)
              handleCreateHighlight('ochre')
            }}
          />
        )}

        {/* Edit Highlight Popover */}
        {editingHighlight && (
          <EditHighlightPopover
            highlight={editingHighlight.highlight}
            rect={editingHighlight.rect}
            onClose={() => setEditingHighlight(null)}
            onUpdate={handleUpdateHighlight}
            onDelete={handleDeleteHighlight}
          />
        )}

        {/* Concept Slide-Over */}
        {concept && (
          <ConceptSlideOver 
            term={concept.term}
            definition={concept.definition}
            contextSnippet={concept.contextSnippet}
            articleId={article.id}
            roomId={article.room_id}
            onClose={() => setConcept(null)}
          />
        )}
      </div>
    </div>
  )
}
