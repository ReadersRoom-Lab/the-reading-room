"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Settings, Loader2, Trash2 } from "lucide-react"
import { logger } from '@/lib/logger'

interface ManageRoomDialogProps {
  roomId: string
  initialName: string
  initialDescription: string | null
}

export function ManageRoomDialog({ roomId, initialName, initialDescription }: Readonly<ManageRoomDialogProps>) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription ?? "")
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const handleUpdate = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Room name is required")
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
      })

      if (!res.ok) {
        throw new Error("Failed to update room")
      }

      toast.success("Room updated successfully")
      setOpen(false)
      router.refresh()
    } catch (error) {
      logger.error(error)
      toast.error("An error occurred while updating the room")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsConfirmingDelete(true)
  }

  const handleConfirmDelete = async () => {
    setDeleting(true)
    
    setDeleting(true)
    
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE"
      })

      if (!res.ok) {
        throw new Error("Failed to delete room")
      }

      toast.success("Room deleted successfully")
      setOpen(false)
      router.push("/rooms")
      router.refresh()
    } catch (error) {
      logger.error(error)
      toast.error("An error occurred while deleting the room")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        setTimeout(() => setIsConfirmingDelete(false), 200); // reset after animation
      }
    }}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2 rounded-none cursor-pointer">
            <Settings className="w-4 h-4" />
            Manage
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] border border-[#E5E5E5] shadow-none bg-white rounded-none">
        {isConfirmingDelete ? (
          <div className="flex flex-col gap-4 mt-2">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl text-red-600">Delete Room?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-2">
              Are you sure you want to delete <span className="font-semibold text-foreground">{name}</span>? 
              <br /><br />
              All articles inside will be safely moved back to your general Library, but the room itself will be deleted permanently.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 rounded-none border-[#E5E5E5]" 
                onClick={() => setIsConfirmingDelete(false)} 
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                className="flex-1 rounded-none bg-red-600 hover:bg-red-700 text-white" 
                onClick={handleConfirmDelete} 
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Yes, Delete Room
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl text-[#1A1A1A]">Manage Room Settings</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleUpdate} className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium">Room Name</label>
                <Input 
                  id="name"
                  placeholder="e.g. Philosophy, Design, History"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading || deleting}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="description" className="text-sm font-medium">Description (Optional)</label>
                <Textarea 
                  id="description"
                  placeholder="What is this room about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading || deleting}
                  className="resize-none"
                />
              </div>
              
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
                <Button type="submit" className="w-full h-10 rounded-none bg-[#1A1A1A] text-white hover:bg-[#444444] transition-colors" disabled={loading || deleting}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Changes
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full h-10 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-600 gap-2 focus:ring-red-200 rounded-none"
                  onClick={handleDelete}
                  disabled={loading || deleting}
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Room
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
