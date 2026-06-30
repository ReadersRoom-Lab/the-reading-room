"use client"

import { useEffect, useState } from "react"
import { ArticleCard, ArticleProps } from "@/components/ArticleCard"
import { BookMarked, Loader2 } from "lucide-react"

export default function LibraryPage() {
  const [articles, setArticles] = useState<ArticleProps['article'][]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('/api/articles')
        if (res.ok) {
          const data = await res.json()
          setArticles(data)
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  return (
    <div className="flex flex-col gap-6 h-full">
      <h1 className="text-4xl font-heading font-bold">Library</h1>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border rounded-xl bg-card">
          <BookMarked className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-heading font-semibold mb-2">Your library is empty</h2>
          <p className="text-muted-foreground max-w-sm text-center">Save articles from the web to read them later without distractions.</p>
        </div>
      )}
    </div>
  )
}
