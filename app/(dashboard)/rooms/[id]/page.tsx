import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import type { ArticleProps } from '@/components/ArticleCard'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ExportRoomButton } from '@/components/ExportRoomButton'
import { ManageRoomDialog } from '@/components/ManageRoomDialog'
import { ArticleCard } from '@/components/ArticleCard'
import { SaveArticleDialog } from '@/components/SaveArticleDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function RoomViewPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
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
        orderBy: { updated_at: 'desc' },
        include: {
          _count: {
            select: { highlights: true }
          }
        }
      }
    }
  })

  if (!room) {
    redirect('/rooms')
  }

  const highlightsCount = room.articles.reduce((acc: number, curr: { _count: { highlights: number } }) => acc + curr._count.highlights, 0)

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
              <span>{highlightsCount} Highlights</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SaveArticleDialog defaultRoomId={room.id} compact />
            <ExportRoomButton roomId={room.id} roomName={room.name} />
            <ManageRoomDialog roomId={room.id} initialName={room.name} initialDescription={room.description} />
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <Tabs defaultValue="all" className="w-full flex-col">
        <TabsList className="mb-8 inline-flex h-auto items-center justify-start rounded-md bg-[#F4F3F3] p-1.5 text-[#52525B] w-fit border border-[#E5E5E5]/50">
          <TabsTrigger value="all" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#52525B] transition-all data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm hover:text-[#1A1A1A] hover:bg-white/50 data-[state=active]:hover:bg-white">
            All ({room.articles.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#52525B] transition-all data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm hover:text-[#1A1A1A] hover:bg-white/50 data-[state=active]:hover:bg-white">
            Unread ({unreadArticles.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#52525B] transition-all data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm hover:text-[#1A1A1A] hover:bg-white/50 data-[state=active]:hover:bg-white">
            In Progress ({inProgressArticles.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#52525B] transition-all data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm hover:text-[#1A1A1A] hover:bg-white/50 data-[state=active]:hover:bg-white">
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
          {unreadArticles.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border bg-card">
              <p className="text-muted-foreground">There are no unread articles in this room.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unreadArticles.map((article: ArticleProps['article']) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="in-progress" className="mt-0 outline-none">
          {inProgressArticles.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border bg-card">
              <p className="text-muted-foreground">There are no articles in progress.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressArticles.map((article: ArticleProps['article']) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0 outline-none">
          {completedArticles.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border bg-card">
              <p className="text-muted-foreground">There are no completed articles in this room.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedArticles.map((article: ArticleProps['article']) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
