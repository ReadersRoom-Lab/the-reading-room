import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Library, ArrowRight } from "lucide-react"
import { CreateRoomDialog } from "@/components/CreateRoomDialog"
import { Card, CardContent } from "@/components/ui/card"

export default async function RoomsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId }
  })

  const rooms = user ? await prisma.room.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: { articles: true }
      }
    }
  }) : []

  return (
    <div className="flex flex-col gap-12 w-full max-w-5xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-heading font-bold">My Rooms</h1>
        <CreateRoomDialog />
      </div>

      {rooms.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border bg-card">
          <Library className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-heading font-semibold mb-2">No rooms created yet</h2>
          <p className="text-muted-foreground max-w-sm text-center">Rooms are themed shelves where you can organize your saved articles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <Link key={room.id} href={`/rooms/${room.id}`} className="block h-full">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col bg-card border-border rounded-none">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <Library className="w-5 h-5 text-primary" />
                    <span className="text-xs font-semibold px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                      {room._count.articles} {room._count.articles === 1 ? 'Article' : 'Articles'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-heading font-semibold mb-2">{room.name}</h3>
                  {room.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                      {room.description}
                    </p>
                  )}
                  <div className="mt-auto pt-4 flex items-center text-sm font-medium text-primary gap-1">
                    Enter Room <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
