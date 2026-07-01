import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import type { ArticleProps } from '@/components/ArticleCard'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, MoreVertical, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExportRoomButton } from '@/components/ExportRoomButton'
import { ArticleCard } from '@/components/ArticleCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function RoomViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId }
  })

  if (!user) {
    redirect('/sign-in')
  }

  const room = await prisma.room.findUnique({
    where: { 
      id: id,
      user_id: user.id
    },
    include: {
      articles: {
        orderBy: { updated_at: 'desc' }
      }
    }
  })

  if (!room) {
    redirect('/rooms')
  }

  const unreadArticles = room.articles.filter((a: ArticleProps['article']) => a.status === 'unread')
  const inProgressArticles = room.articles.filter((a: ArticleProps['article']) => a.status === 'in-progress')
  const completedArticles = room.articles.filter((a: ArticleProps['article']) => a.status === 'finished')

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-border pb-8">
        <Link href="/rooms" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Rooms
        </Link>
        
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-heading font-bold">{room.name}</h1>
            {room.description && (
              <p className="text-muted-foreground max-w-2xl text-lg font-source-serif">
                {room.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground uppercase tracking-widest font-semibold">
              <span>{room.articles.length} Articles</span>
              <span>•</span>
              <span>0 Highlights</span> {/* Placeholder for Phase 5 */}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportRoomButton roomId={room.id} roomName={room.name} />
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" /> Manage
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 bg-transparent border-b border-border rounded-none h-auto p-0 justify-start space-x-8">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-2 text-sm font-semibold uppercase tracking-widest">
            All ({room.articles.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-2 text-sm font-semibold uppercase tracking-widest">
            Unread ({unreadArticles.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-2 text-sm font-semibold uppercase tracking-widest">
            In Progress ({inProgressArticles.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-2 text-sm font-semibold uppercase tracking-widest">
            Completed ({completedArticles.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0 outline-none">
          {room.articles.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border bg-card">
              <p className="text-muted-foreground">This room is empty. Move articles here from your library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {room.articles.map((article: ArticleProps['article']) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="unread" className="mt-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unreadArticles.map((article: ArticleProps['article']) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="in-progress" className="mt-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressArticles.map((article: ArticleProps['article']) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedArticles.map((article: ArticleProps['article']) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
