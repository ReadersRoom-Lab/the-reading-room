"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Type, Loader2, Save, X } from "lucide-react"
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

export default function ReaderPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Settings
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif')
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base')
  const [showAnnotate, setShowAnnotate] = useState(false)
  
  // Progress tracking
  const [progress, setProgress] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setArticle(data)
          setProgress(data.reading_progress || 0)
        }
      } catch (err) {
        console.error("Error fetching article", err)
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
      setProgress(currentProgress > 100 ? 100 : currentProgress)
    }
  }, [progress])

  // Save progress when unmounting
  useEffect(() => {
    return () => {
      if (article && progress > (article.reading_progress || 0)) {
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
          
          <Button variant="secondary" size="sm" onClick={() => setShowAnnotate(!showAnnotate)}>
            {showAnnotate ? 'Close Annotate' : 'Annotate'}
          </Button>
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
          className={`flex-1 overflow-y-auto px-6 py-12 scroll-smooth ${showAnnotate ? 'md:mr-96' : ''}`}
        >
          <article 
            className={`
              mx-auto max-w-2xl
              prose prose-stone dark:prose-invert
              ${fontFamily === 'serif' ? 'font-source-serif' : 'font-sans'}
              ${fontSize === 'sm' ? 'prose-sm' : fontSize === 'base' ? 'prose-base' : fontSize === 'lg' ? 'prose-lg' : 'prose-xl'}
            `}
          >
            {article.cover_image && (
               // eslint-disable-next-line @next/next/no-img-element
              <img src={article.cover_image} alt="Cover" className="w-full h-64 object-cover rounded-xl mb-8" />
            )}
            <h1 className="font-heading mb-8">{article.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: article.content || article.textContent }} />
          </article>
        </div>

        {/* Annotate Sidebar Placeholder */}
        {showAnnotate && (
          <aside className="absolute right-0 top-0 bottom-0 w-96 border-l border-border bg-sidebar shrink-0 flex flex-col animate-in slide-in-from-right-full z-20">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-heading font-semibold text-lg">Annotate</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAnnotate(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6 p-4 border-l-2 border-primary bg-primary/5 rounded-r-md">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Selected Text</p>
                <p className="italic text-sm">"Select text in the article to begin annotating. (Feature coming in Phase 5)"</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">Classification</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start text-xs h-9">👍 Supports Argument</Button>
                    <Button variant="outline" className="justify-start text-xs h-9">👎 Contradicts</Button>
                    <Button variant="outline" className="justify-start text-xs h-9">⭐ Key Finding</Button>
                    <Button variant="outline" className="justify-start text-xs h-9">🔬 Methodology</Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">Analysis Note</p>
                  <textarea 
                    className="w-full min-h-[120px] p-3 text-sm bg-background border border-input rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Add your insights here..."
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border bg-background mt-auto">
              <Button className="w-full gap-2 text-primary-foreground bg-primary">
                <Save className="w-4 h-4" />
                <span>Save Analysis</span>
              </Button>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
