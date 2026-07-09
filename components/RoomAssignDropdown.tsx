"use client";

import { useState, useEffect } from "react";
import { MoreVertical, Library, Check, Loader2, Trash2, FolderOpen, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateRoomDialog } from "./CreateRoomDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RoomAssignDropdownProps {
  articleId: string;
  currentRoomId?: string | null;
  onDeleteSuccess?: () => void;
}

export function RoomAssignDropdown({
  articleId,
  currentRoomId,
  onDeleteSuccess,
}: Readonly<RoomAssignDropdownProps>) {
  const router = useRouter();
  const [rooms, setRooms] = useState<{ id: string; name: string; cover_color: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRooms(data);
      });
  }, []);

  const assignRoom = async (roomId: string | null) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/room`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      if (res.ok) {
        toast.success(roomId ? "Moved to room" : "Removed from room");
        router.refresh();
      }
    } catch {
      toast.error("Failed to move article");
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Document deleted successfully");
        setIsDeleteDialogOpen(false);
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
        router.refresh();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete article");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete article";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerInteraction = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleContentInteraction = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={handleTriggerInteraction}
          onKeyDown={handleTriggerInteraction}
          aria-label="Article options"
          title="Article options"
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:bg-[#E5E5E5] hover:text-[#1A1A1A] h-8 w-8 -mr-2 text-muted-foreground outline-none border-none bg-transparent rounded-none"
        >
          <MoreVertical className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={handleContentInteraction}
          onKeyDown={handleContentInteraction}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs uppercase text-muted-foreground tracking-wider font-semibold">
              Move to Room
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => assignRoom(null)}
              className="justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Library className="w-4 h-4 text-muted-foreground" />
                <span>No Room (Library)</span>
              </div>
              {!currentRoomId && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
            {rooms.map((room) => (
              <DropdownMenuItem
                key={room.id}
                onClick={() => assignRoom(room.id)}
                className="justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{room.name}</span>
                </div>
                {currentRoomId === room.id && <Check className="w-4 h-4 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setIsCreateRoomOpen(true)}
              className="justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-muted-foreground" />
                <span>Create New Room</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              setIsDeleteDialogOpen(true);
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
        onSuccess={(newRoomId?: string) => {
          // Re-fetch rooms when a new one is created
          fetch("/api/rooms")
            .then((res) => res.json())
            .then((data) => {
              if (Array.isArray(data)) setRooms(data);
            });
          if (newRoomId) {
            assignRoom(newRoomId);
          }
        }}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-[425px] border border-[#E5E5E5] shadow-none bg-white rounded-none"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-[#1A1A1A]">
              Delete Document
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-end gap-2 flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDeleteDialogOpen(false);
              }}
              disabled={loading}
              className="rounded-none border-[#E5E5E5]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-none bg-red-600 hover:bg-red-700 text-white"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteArticle();
              }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
