import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock } from "lucide-react"
import Link from "next/link"

export interface ArticleProps {
  article: {
    id: string
    title: string
    author: string | null
    source_url: string
    cover_image: string | null
    read_time_minutes: number
    reading_progress: number
    status: string
  }
}

export function ArticleCard({ article }: ArticleProps) {
  let domain = ""
  try {
    domain = new URL(article.source_url).hostname.replace('www.', '')
  } catch(e) {
    domain = "Unknown"
  }

  return (
    <Link href={`/read/${article.id}`} className="block h-full">
      <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-border bg-card">
      {article.cover_image && (
        <div className="h-40 w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={article.cover_image} 
            alt={article.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="flex-1 pb-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Badge variant="secondary" className="text-xs font-normal">
            {domain}
          </Badge>
          {article.status === 'finished' && (
            <Badge className="text-xs bg-emerald-600 hover:bg-emerald-700">Finished</Badge>
          )}
        </div>
        <CardTitle className="line-clamp-2 leading-tight text-lg font-heading">{article.title}</CardTitle>
        {article.author && (
          <p className="text-sm text-muted-foreground line-clamp-1">{article.author}</p>
        )}
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <Clock className="w-3 h-3 mr-1" />
          <span>{article.read_time_minutes} min read</span>
        </div>
        
        {article.reading_progress > 0 && article.status !== 'finished' && (
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1 text-muted-foreground">
              <span>Progress</span>
              <span>{article.reading_progress}%</span>
            </div>
            <Progress value={article.reading_progress} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
    </Link>
  )
}
