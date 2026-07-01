import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Library } from "lucide-react"
import { CreateRoomDialog } from "@/components/CreateRoomDialog"
import { format } from 'date-fns'

type RoomWithCounts = {
  id: string
  name: string
  cover_color: string
  mode: string
  created_at: Date
  _count: {
    articles: number
    vaultTrails: number
  }
  articles: {
    _count: {
      highlights: number
    }
  }[]
}

export default async function RoomsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId }
  })

  const rooms: RoomWithCounts[] = user ? await prisma.room.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: { articles: true, vaultTrails: true }
      },
      articles: {
        select: {
          _count: {
            select: { highlights: true }
          }
        }
      }
    }
  }) : []

  return (
    <div className="flex flex-col gap-12 w-full max-w-3xl mx-auto py-12 px-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-heading font-bold text-[#1a1a1a]">My Rooms</h1>
        <p className="text-sm font-source-serif text-muted-foreground mb-4">
          Manage your intellectual environments and curated research clusters.
        </p>
        <div className="w-fit">
          <CreateRoomDialog />
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border bg-card">
          <Library className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-heading font-semibold mb-2">No rooms created yet</h2>
          <p className="text-muted-foreground max-w-sm text-center">Rooms are themed shelves where you can organize your saved articles.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {rooms.map(room => {
            const highlightsCount = room.articles.reduce((acc, curr) => acc + curr._count.highlights, 0)
            const isResearch = room.mode === 'research' || room.name.toLowerCase().includes('thesis') || room.name.toLowerCase().includes('ethics') || room.name.toLowerCase().includes('learning')

            return (
              <Link key={room.id} href={`/rooms/${room.id}`} className="block group">
                <div className="flex flex-col bg-[#F9F8F6] hover:bg-[#F2F0EB] transition-colors overflow-hidden border border-border/50">
                  {/* Cover Image Placeholder - simple gradient */}
                  <div className="h-32 w-full opacity-80 mix-blend-multiply" style={{ background: `linear-gradient(135deg, ${room.cover_color}33 0%, #1a1a1a11 100%)` }}></div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                          {isResearch ? 'Research Room' : 'Reading Room'}
                        </span>
                        {isResearch && (
                          <span className="text-[9px] font-bold tracking-widest uppercase bg-[#D17659] text-white px-1.5 py-0.5 rounded-sm">PRO</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        {format(new Date(room.created_at), 'MMM dd')}
                      </span>
                    </div>
                    
                    <h3 className="text-3xl font-heading font-semibold text-[#1a1a1a] mb-8">{room.name}</h3>
                    
                    <div className="grid grid-cols-2 max-w-xs gap-y-2 text-xs text-muted-foreground">
                      <span>Articles</span>
                      <span className="text-right font-medium text-[#1a1a1a]">{room._count.articles}</span>
                      
                      <span>Highlights</span>
                      <span className="text-right font-medium text-[#1a1a1a]">{highlightsCount}</span>
                      
                      <span>Vault</span>
                      <span className="text-right font-medium text-[#1a1a1a]">{room._count.vaultTrails}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
