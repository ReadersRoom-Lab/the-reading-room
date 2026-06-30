"use client"

import { useState, useEffect } from "react"
import { MoreVertical, Library, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function RoomAssignDropdown({ articleId, currentRoomId }: { articleId: string, currentRoomId?: string | null }) {
  const router = useRouter()
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    fetch('/api/rooms').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setRooms(data)
    })
  }, [])

  const assignRoom = async (roomId: string | null) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/articles/${articleId}/room`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId })
      })
      if (res.ok) {
        toast.success(roomId ? "Moved to room" : "Removed from room")
        router.refresh()
      }
    } catch(err) {
      toast.error("Failed to move article")
    } finally {
      setLoading(false)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div onClick={handleClick}>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-muted/50 hover:text-accent-foreground h-8 w-8 -mr-2 text-muted-foreground outline-none border-none bg-transparent">
          <MoreVertical className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs uppercase text-muted-foreground tracking-wider">Move to Room</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => assignRoom(null)} className="justify-between cursor-pointer">
            <span>No Room (Library)</span>
            {!currentRoomId && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
          {rooms.map(room => (
            <DropdownMenuItem key={room.id} onClick={() => assignRoom(room.id)} className="justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Library className="w-4 h-4 text-muted-foreground" />
                <span>{room.name}</span>
              </div>
              {currentRoomId === room.id && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          {loading && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2 flex items-center justify-center text-muted-foreground text-xs">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Moving...
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
