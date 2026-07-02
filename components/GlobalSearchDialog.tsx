"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { FileText, Folder, BookOpen, Search } from "lucide-react"
import { logger } from '@/lib/logger'

export function GlobalSearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    articles: Record<string, string>[],
    rooms: Record<string, string>[],
    concepts: Record<string, string>[]
  }>({ articles: [], rooms: [], concepts: [] })
  
  const [isMac, setIsMac] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform))
    }

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (!query) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults({ articles: [], rooms: [], concepts: [] })
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        }
      } catch (error) {
        logger.error("Search failed:", error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-2 py-1.5 text-sm font-sans text-[#747878] hover:text-[#1A1A1A] border border-[#E5E5E5] hover:border-[#BDBDBD] bg-white w-full transition-colors"
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left">Search library...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-0.5 border border-[#E5E5E5] bg-[#F4F3F3] px-1.5 font-mono text-[10px] font-medium text-[#747878]">
          <span className="text-xs">{mounted ? (isMac ? "⌘" : "Ctrl") : "⌘"}</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
          <CommandInput 
            placeholder="Search articles, rooms, and concepts..." 
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Searching..." : "No results found."}
            </CommandEmpty>
            
            {results.articles.length > 0 && (
              <CommandGroup heading="Articles">
                {results.articles.map((article) => (
                  <CommandItem
                    key={article.id}
                    value={`article-${article.id}-${article.title}`}
                    onSelect={() => {
                      runCommand(() => router.push(`/read/${article.id}`))
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{article.title}</span>
                    {article.author && (
                      <span className="ml-2 text-xs text-muted-foreground">- {article.author}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.rooms.length > 0 && (
              <CommandGroup heading="Rooms">
                {results.rooms.map((room) => (
                  <CommandItem
                    key={room.id}
                    value={`room-${room.id}-${room.name}`}
                    onSelect={() => {
                      runCommand(() => router.push(`/rooms/${room.id}`))
                    }}
                  >
                    <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{room.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.concepts.length > 0 && (
              <CommandGroup heading="Vocabulary Vault">
                {results.concepts.map((concept) => (
                  <CommandItem
                    key={concept.id}
                    value={`concept-${concept.id}-${concept.term}`}
                    onSelect={() => {
                      runCommand(() => router.push(`/vault`))
                    }}
                  >
                    <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{concept.term}</span>
                    <span className="ml-2 text-xs text-muted-foreground truncate max-w-[200px]">
                      {concept.definition}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
