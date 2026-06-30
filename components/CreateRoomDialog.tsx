"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"

export function CreateRoomDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Room name is required")
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
      })

      if (!res.ok) {
        throw new Error("Failed to create room")
      }

      toast.success("Room created successfully")
      setOpen(false)
      setName("")
      setDescription("")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4">
        <Plus className="w-4 h-4" />
        Create Room
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium">Room Name</label>
            <Input 
              id="name"
              placeholder="e.g. Philosophy, Design, History"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description (Optional)</label>
            <Textarea 
              id="description"
              placeholder="What is this room about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="resize-none"
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Create Room
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
