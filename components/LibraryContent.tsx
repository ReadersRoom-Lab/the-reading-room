"use client";

import { useState } from "react";
import { LayoutGrid, List, Trash2, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { ArticleCard } from "./ArticleCard";
import { RoomAssignDropdown } from "./RoomAssignDropdown";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { toast } from "sonner";

export interface LibraryArticle {
  id: string;
  title: string;
  author: string | null;
  source_url: string;
  cover_image: string | null;
  read_time_minutes: number;
  reading_progress: number;
  status: string;
  room_id?: string | null;
  updated_at?: string | Date;
}

export interface LibraryRoom {
  id: string;
  name: string;
}

interface LibraryContentProps {
  initialArticles: LibraryArticle[];
  rooms: LibraryRoom[];
}

export function LibraryContent({ initialArticles, rooms }: Readonly<LibraryContentProps>) {
  const [articles, setArticles] = useState<LibraryArticle[]>(initialArticles);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(articles.map((a) => a.id)));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSuccess = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (
      !globalThis.confirm(`Are you sure you want to delete ${selectedIds.size} selected articles?`)
    ) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/articles/${id}`, { method: "DELETE" })
      );
      await Promise.all(deletePromises);

      setArticles((prev) => prev.filter((a) => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
      toast.success(`Successfully deleted ${selectedIds.size} articles.`);
    } catch (err) {
      toast.error("Failed to delete selected articles.");
      console.error(err);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkAssignRoom = async (roomId: string | null) => {
    if (selectedIds.size === 0) return;
    setIsBulkAssigning(true);

    try {
      const updatePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/articles/${id}/room`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room_id: roomId }),
        })
      );
      await Promise.all(updatePromises);

      setArticles((prev) =>
        prev.map((a) => (selectedIds.has(a.id) ? { ...a, room_id: roomId } : a))
      );
      setSelectedIds(new Set());
      const roomName = rooms.find((r) => r.id === roomId)?.name || "No Room";
      toast.success(`Assigned ${selectedIds.size} articles to "${roomName}".`);
    } catch (err) {
      toast.error("Failed to assign room to selected articles.");
      console.error(err);
    } finally {
      setIsBulkAssigning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Top Bar Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-4 rounded-none shadow-xs">
        {/* Select All & Selection Status */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] hover:text-[#D17659] transition-colors cursor-pointer"
          >
            {selectedIds.size > 0 && selectedIds.size === articles.length ? (
              <CheckSquare className="w-4 h-4 text-[#1A1A1A]" />
            ) : (
              <Square className="w-4 h-4 text-[#52525B]" />
            )}
            <span>{selectedIds.size > 0 ? `${selectedIds.size} Selected` : "Select All"}</span>
          </button>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 animate-in fade-in duration-200">
            <div className="relative inline-block">
              <select
                disabled={isBulkAssigning}
                onChange={(e) => handleBulkAssignRoom(e.target.value || null)}
                value=""
                className="bg-[#FAF9F5] border border-[#E5E5E5] text-xs font-bold uppercase tracking-wider text-[#1A1A1A] px-3 py-1.5 rounded-none cursor-pointer focus:outline-none hover:border-[#1A1A1A]"
              >
                <option value="" disabled>
                  Assign Room...
                </option>
                <option value="">Unassign Room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={isBulkDeleting}
              onClick={handleBulkDelete}
              className="h-8 px-3 text-xs font-bold uppercase tracking-wider text-red-600 border-red-200 hover:bg-red-50 rounded-none gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete ({selectedIds.size})
            </Button>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex border border-[#E5E5E5] bg-white p-1 gap-1 rounded-none text-xs shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1 font-medium transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#1A1A1A] text-[#F9F7F2] font-semibold"
                : "text-[#52525B] hover:text-[#1A1A1A]"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1 font-medium transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-[#1A1A1A] text-[#F9F7F2] font-semibold"
                : "text-[#52525B] hover:text-[#1A1A1A]"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Compact Table</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            const isSelected = selectedIds.has(article.id);
            return (
              <div key={article.id} className={isSelected ? "ring-2 ring-[#1A1A1A]" : ""}>
                <ArticleCard
                  article={article}
                  isSelected={isSelected}
                  onSelect={(e) => toggleSelectOne(article.id, e)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        /* Compact Table View */
        <div className="bg-white border border-[#E5E5E5] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#E5E5E5] font-bold uppercase tracking-wider text-[#52525B]">
                <th className="p-3 w-10 text-center">
                  <button type="button" onClick={toggleSelectAll} className="cursor-pointer">
                    {selectedIds.size > 0 && selectedIds.size === articles.length ? (
                      <CheckSquare className="w-4 h-4 text-[#1A1A1A]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#52525B]" />
                    )}
                  </button>
                </th>
                <th className="p-3">Title</th>
                <th className="p-3">Author</th>
                <th className="p-3">Read Time</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-8 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {articles.map((article) => {
                const isSelected = selectedIds.has(article.id);
                return (
                  <tr
                    key={article.id}
                    className={`hover:bg-[#FAF9F5] transition-colors ${
                      isSelected ? "bg-[#FAF9F5]" : ""
                    }`}
                  >
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => toggleSelectOne(article.id, e)}
                        className="cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#1A1A1A]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#52525B]" />
                        )}
                      </button>
                    </td>

                    <td className="p-3 font-semibold text-[#1A1A1A] max-w-xs truncate">
                      <Link href={`/read/${article.id}`} className="hover:underline">
                        {article.title}
                      </Link>
                    </td>

                    <td className="p-3 text-[#52525B] truncate max-w-[140px]">
                      {article.author || "—"}
                    </td>

                    <td className="p-3 text-[#52525B] whitespace-nowrap">
                      {article.read_time_minutes} mins
                    </td>

                    <td className="p-3 w-32">
                      <div className="flex items-center gap-2">
                        <Progress value={article.reading_progress} className="h-1.5 flex-1" />
                        <span className="text-[10px] text-[#52525B]">
                          {article.reading_progress}%
                        </span>
                      </div>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <Badge
                        variant={article.status === "finished" ? "default" : "secondary"}
                        className={`text-[9px] uppercase font-bold tracking-wider ${
                          article.status === "finished" ? "bg-emerald-800 text-white" : ""
                        }`}
                      >
                        {article.status}
                      </Badge>
                    </td>

                    <td className="p-3 pr-8 text-center whitespace-nowrap">
                      <RoomAssignDropdown
                        articleId={article.id}
                        currentRoomId={article.room_id}
                        onDeleteSuccess={() => handleDeleteSuccess(article.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
