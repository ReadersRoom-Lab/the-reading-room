"use client"

import { useEffect, useState } from "react"
import { ArticleCard, ArticleProps } from "@/components/ArticleCard"
import { BookMarked, Loader2 } from "lucide-react"
import { logger } from '@/lib/logger'

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
        logger.error("Failed to fetch articles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-[#E5E5E5] pb-8">
        <h1 className="font-heading text-5xl font-bold text-[#1A1A1A] mb-2">Library</h1>
        <p className="font-sans text-sm text-[#747878]">Your saved articles and documents.</p>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-6 h-6 animate-spin text-[#BDBDBD]" />
        </div>
      )}
      {!loading && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
      {!loading && articles.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-[#E5E5E5] bg-white p-12 text-center">
          <BookMarked className="w-8 h-8 text-[#BDBDBD] mb-4" />
          <h2 className="font-heading text-2xl font-semibold text-[#1A1A1A] mb-2">Your library is empty</h2>
          <p className="font-sans text-sm text-[#747878] max-w-sm">Save articles from the web to read them later without distractions.</p>
        </div>
      )}
    </div>
  )
}
