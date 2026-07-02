"use client"

import { useState, useEffect } from "react"
import { MoreVertical, Library, Check, Loader2, Trash2, FolderOpen, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CreateRoomDialog } from "./CreateRoomDialog"

interface RoomAssignDropdownProps {
  articleId: string
  currentRoomId?: string | null
}

export function RoomAssignDropdown({ articleId, currentRoomId }: Readonly<RoomAssignDropdownProps>) {
  const router = useRouter()
  const [rooms, setRooms] = useState<{ id: string, name: string, cover_color: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false)
  
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
    } catch {
      toast.error("Failed to move article")
    } finally {
      setLoading(false)
    }
  }

  const deleteArticle = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success("Document deleted successfully")
        router.refresh()
      } else {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete article")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete article";
      toast.error(msg);
    } finally {
      setLoading(false)
    }
  }

  const handleInteraction = (e: React.SyntheticEvent) => {
    // Always stop React event bubbling so the parent <Link> doesn't trigger
    e.stopPropagation()
    
    // Only prevent native default (which breaks typing in inputs or form submissions)
    // if the event originated from WITHIN the physical DOM of this div.
    // Portals (like the Dropdown content and Dialog content) exist outside this div in the DOM,
    // so we don't need to preventDefault for them, because they aren't natively inside the <a> tag.
    if (e.currentTarget.contains(e.target as Node)) {
      e.preventDefault()
    }
  }

  return (
    <div onClick={handleInteraction} onKeyDown={handleInteraction}>
      <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:bg-[#E5E5E5] hover:text-[#1A1A1A] h-8 w-8 -mr-2 text-muted-foreground outline-none border-none bg-transparent rounded-none">
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs uppercase text-muted-foreground tracking-wider font-semibold">Move to Room</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => assignRoom(null)} className="justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Library className="w-4 h-4 text-muted-foreground" />
                  <span>No Room (Library)</span>
                </div>
                {!currentRoomId && <Check className="w-4 h-4 text-primary" />}
              </DropdownMenuItem>
              {rooms.map(room => (
                <DropdownMenuItem key={room.id} onClick={() => assignRoom(room.id)} className="justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    <span>{room.name}</span>
                  </div>
                  {currentRoomId === room.id && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsCreateRoomOpen(true)} className="justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                  <span>Create New Room</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                // Base-ui uses onClick.
                deleteArticle();
              }} 
              className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-950/20 cursor-pointer flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Document</span>
            </DropdownMenuItem>
            {loading && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2 flex items-center justify-center text-muted-foreground text-xs">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Working...
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

      <CreateRoomDialog 
        open={isCreateRoomOpen} 
        onOpenChange={setIsCreateRoomOpen} 
        hideTrigger 
        onSuccess={() => {
          // Re-fetch rooms when a new one is created
          fetch('/api/rooms').then(res => res.json()).then(data => {
            if (Array.isArray(data)) setRooms(data)
          })
        }}
      />
    </div>
  )
}
