"use client";

import React, { useState, useMemo } from "react";
import {
  BookMarked,
  Search,
  BookOpen,
  FolderOpen,
  Calendar,
  Trash2,
  ChevronRight,
  Columns,
  Grid3X3,
  BookA,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { FlashcardModal } from "./FlashcardModal";

interface Article {
  id: string;
  title: string;
  source_url: string;
}

interface Room {
  id: string;
  name: string;
}

interface VaultTrail {
  id: string;
  vault_entry_id: string;
  article_id: string;
  room_id: string | null;
  passage: string;
  found_at: string | Date;
  article: Article;
  room: Room | null;
}

interface VaultEntry {
  id: string;
  user_id: string;
  term: string;
  type: string;
  definition: string;
  pronunciation: string | null;
  etymology: string | null;
  example_sentence: string | null;
  user_note: string | null;
  created_at: string | Date;
  vaultTrails: VaultTrail[];
}

interface VaultContentProps {
  initialEntries: VaultEntry[];
}

export function VaultContent({ initialEntries }: Readonly<VaultContentProps>) {
  const [entries, setEntries] = useState<VaultEntry[]>(initialEntries);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewLayout, setViewLayout] = useState<"grid" | "split">("grid");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(
    initialEntries.length > 0 ? initialEntries[0].id : null
  );
  // Track mobile view: show list ("list") or details ("details")
  const [mobileView, setMobileView] = useState<"list" | "details">("list");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [activeGridEntry, setActiveGridEntry] = useState<VaultEntry | null>(null);
  const [practiceOpen, setPracticeOpen] = useState(false);

  // 1. Filter entries based on search term
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      return (
        entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.user_note?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      );
    });
  }, [entries, searchTerm]);

  // 2. Select the currently active entry in split view
  const selectedEntry = useMemo(() => {
    if (filteredEntries.length === 0) return null;
    const found = filteredEntries.find((e) => e.id === selectedEntryId);
    return found || filteredEntries[0];
  }, [filteredEntries, selectedEntryId]);

  // 3. Handle entry deletion
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this entry from your vault?")) {
      return;
    }

    setIsDeleting(id);

    try {
      const response = await fetch(`/api/vault?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }

      toast.success("Entry removed from Vault");
      setEntries((prev) => prev.filter((item) => item.id !== id));

      // Reset selection if deleted the currently selected entry
      if (selectedEntryId === id) {
        const remaining = filteredEntries.filter((item) => item.id !== id);
        setSelectedEntryId(remaining.length > 0 ? remaining[0].id : null);
      }
      if (activeGridEntry?.id === id) {
        setActiveGridEntry(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not delete the entry");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSelectEntry = (id: string) => {
    setSelectedEntryId(id);
    setMobileView("details");
  };

  // Helper render function for Split View layout
  const renderSplitView = () => {
    return (
      <div className="flex flex-1 overflow-hidden border border-[#E5E5E5] bg-white rounded-none">
        {/* Master list (left side) */}
        <div
          className={`w-full md:w-[350px] border-r border-[#E5E5E5] flex flex-col overflow-y-auto shrink-0 ${
            mobileView === "details" ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="divide-y divide-[#F0F0F0]">
            {filteredEntries.map((entry) => {
              const isActive = selectedEntry?.id === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleSelectEntry(entry.id)}
                  className={`w-full text-left p-4 cursor-pointer transition-colors relative flex items-center justify-between group ${
                    isActive
                      ? "bg-[#F9F7F2] border-l-4 border-l-[#1A1A1A] pl-3"
                      : "hover:bg-[#FCFBF8]/80 border-l-4 border-l-transparent pl-3"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#BDBDBD]">
                        {format(new Date(entry.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1A1A1A] truncate group-hover:text-black">
                      {entry.term}
                    </h3>
                    <p className="text-xs text-[#52525B] truncate mt-0.5 font-source-serif">
                      {entry.definition}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={isDeleting === entry.id}
                      onClick={(e) => handleDelete(entry.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-600 p-1 transition-opacity text-[#BDBDBD] hover:bg-[#F4F4F5] rounded-none"
                      title="Delete term"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-[#BDBDBD] shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Details pane (right side) */}
        <div
          className={`flex-1 flex flex-col bg-[#FAF9F5]/40 overflow-y-auto ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Mobile back button */}
          <div className="p-4 border-b border-[#E5E5E5] bg-white flex items-center md:hidden shrink-0">
            <button
              onClick={() => setMobileView("list")}
              className="flex items-center gap-2 text-xs font-medium text-[#52525B]"
            >
              <ArrowLeft className="w-4 h-4" /> Back to List
            </button>
          </div>

          {selectedEntry ? (
            <div className="p-6 md:p-8 flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[9px] font-bold tracking-widest px-2 py-0.5 text-white ${
                      selectedEntry.type === "concept" ? "bg-indigo-600" : "bg-emerald-600"
                    }`}
                  >
                    {selectedEntry.type === "concept" ? "CONCEPT" : "VOCABULARY"}
                  </span>
                  <span className="text-xs text-[#8C8C8C] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Saved on {format(new Date(selectedEntry.created_at), "MMMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="font-heading text-3xl font-bold text-[#1A1A1A]">
                      {selectedEntry.term}
                    </h2>
                    {selectedEntry.pronunciation && (
                      <span className="text-xs font-mono text-[#8C8C8C]">
                        {selectedEntry.pronunciation}
                      </span>
                    )}
                  </div>
                  <button
                    disabled={isDeleting === selectedEntry.id}
                    onClick={(e) => handleDelete(selectedEntry.id, e)}
                    className="text-xs flex items-center gap-1 text-[#8C8C8C] hover:text-red-600 border border-[#E5E5E5] px-2.5 py-1.5 bg-white hover:bg-red-50/50 transition-colors rounded-none font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Entry
                  </button>
                </div>
              </div>

              {/* Definition Card (Serif font) */}
              <div className="bg-white border border-[#E6C79C]/40 p-6 shadow-sm relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#E6C79C]"></div>
                <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#E6C79C] mb-2">
                  Meaning / Explanation
                </h4>
                <p className="font-source-serif text-lg leading-relaxed text-[#1A1A1A] italic">
                  {selectedEntry.definition}
                </p>
              </div>

              {/* Etymology / Origin Card */}
              {selectedEntry.etymology && (
                <div className="bg-white border border-[#E5E5E5] p-5">
                  <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#8C8C8C] mb-2">
                    Word Origin & Etymology
                  </h4>
                  <p className="font-source-serif text-sm leading-relaxed text-[#333333] italic">
                    {selectedEntry.etymology}
                  </p>
                </div>
              )}

              {/* Optional metadata (User Note) */}
              {selectedEntry.user_note && (
                <div className="bg-white border border-[#E5E5E5] p-5">
                  <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#52525B] mb-2 flex items-center gap-1">
                    <BookA className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    Personal Note
                  </h4>
                  <p className="text-sm font-sans text-[#333333] leading-relaxed">
                    {selectedEntry.user_note}
                  </p>
                </div>
              )}

              {/* Vault trails (where found and what passage) */}
              {selectedEntry.vaultTrails && selectedEntry.vaultTrails.length > 0 && (
                <div className="flex flex-col gap-4 mt-2">
                  <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#8C8C8C] border-b border-[#E5E5E5] pb-2">
                    Context & Occurrences
                  </h4>

                  {selectedEntry.vaultTrails.map((trail) => (
                    <div
                      key={trail.id}
                      className="bg-white border border-[#E5E5E5] p-5 flex flex-col gap-3"
                    >
                      {/* Highlighted text block */}
                      {trail.passage && (
                        <div className="relative pl-4 border-l-2 border-l-[#E5E5E5]">
                          <span className="absolute left-0 top-0 text-3xl font-serif text-[#E5E5E5] select-none -translate-x-1 -translate-y-2">
                            “
                          </span>
                          <p className="font-source-serif text-sm text-[#52525B] leading-relaxed italic pr-4">
                            {trail.passage}
                          </p>
                        </div>
                      )}

                      {/* Occurrence metadata */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#8C8C8C] pt-2 border-t border-[#F0F0F0] mt-1 font-medium">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>
                            Found in:{" "}
                            <Link
                              href={`/read/${trail.article_id}`}
                              className="text-[#1a1a1a] hover:underline"
                            >
                              {trail.article.title}
                            </Link>
                          </span>
                        </div>

                        {trail.room && (
                          <div className="flex items-center gap-1.5">
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>
                              Room:{" "}
                              <Link
                                href={`/rooms/${trail.room_id}`}
                                className="text-[#1a1a1a] hover:underline"
                              >
                                {trail.room.name}
                              </Link>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#8C8C8C]">
              <Sparkles className="w-8 h-8 text-[#BDBDBD] mb-2" />
              <p className="text-sm">Select an entry to view details</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper render function for Grid View layout
  const renderGridView = () => {
    return (
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.map((entry) => {
            const firstTrail = entry.vaultTrails[0];
            return (
              <button
                key={entry.id}
                type="button"
                className="w-full text-left bg-white border border-[#E5E5E5] p-5 flex flex-col justify-between h-56 transition-all hover:border-[#1A1A1A] group cursor-pointer"
                onClick={() => {
                  setActiveGridEntry(entry);
                }}
              >
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#BDBDBD]">
                      {format(new Date(entry.created_at), "MMM d, yyyy")}
                    </span>
                    <button
                      type="button"
                      disabled={isDeleting === entry.id}
                      onClick={(e) => handleDelete(entry.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-600 p-0.5 transition-opacity text-[#BDBDBD] hover:bg-[#F4F4F5] rounded-none"
                      title="Delete term"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#1A1A1A] mb-2 truncate">
                    {entry.term}
                  </h3>
                  <p className="font-source-serif text-sm leading-relaxed text-[#333333] line-clamp-3">
                    {entry.definition}
                  </p>
                </div>

                {firstTrail && (
                  <div className="pt-2 border-t border-[#F0F0F0] mt-3 flex items-center gap-1 text-[10px] text-[#8C8C8C] truncate font-medium">
                    <BookOpen className="w-3 h-3 text-[#BDBDBD] shrink-0" />
                    <span className="truncate">
                      From: <span className="text-[#1A1A1A]">{firstTrail.article.title}</span>
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper render function for empty states
  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center flex-1 border border-[#E5E5E5] bg-white p-12 text-center rounded-none shrink-0">
        <BookMarked className="w-8 h-8 text-[#BDBDBD] mb-4" />
        <h2 className="font-heading text-2xl font-semibold text-[#1A1A1A] mb-2">
          No entries found
        </h2>
        <p className="font-sans text-sm text-[#52525B] max-w-md">
          {entries.length === 0
            ? "Highlight words while reading to save concepts, definitions, and contexts directly to your vault."
            : "Try adjusting your search criteria or type filters to find what you're looking for."}
        </p>
      </div>
    );
  };

  let mainContent;
  if (filteredEntries.length === 0) {
    mainContent = renderEmptyState();
  } else if (viewLayout === "split") {
    mainContent = renderSplitView();
  } else {
    mainContent = renderGridView();
  }

  return (
    <div className="flex flex-col w-full h-[calc(100vh-140px)] min-h-[550px] font-sans">
      {/* Header section with Title and Controls */}
      <div className="flex flex-col gap-4 border-b border-[#E5E5E5] pb-6 mb-6 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              Vocabulary Vault
            </h1>
            <p className="font-sans text-xs text-[#52525B] mt-1">
              {entries.length} word{entries.length === 1 ? "" : "s"} saved in total
            </p>
          </div>

          {/* Search bar, Practice button & View Layout Toggles */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {entries.length > 0 && (
              <Button
                onClick={() => setPracticeOpen(true)}
                className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none h-10 px-4 text-xs font-bold uppercase tracking-wider gap-2 shrink-0"
              >
                <Sparkles className="w-4 h-4 text-[#E6C79C]" />
                Practice Flashcards
              </Button>
            )}

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#BDBDBD]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search saved words..."
                aria-label="Search saved vocabulary words"
                className="w-full pl-9 pr-4 py-2 border border-[#E5E5E5] bg-white rounded-none focus:outline-none focus:border-[#1A1A1A] transition-colors text-sm text-[#1A1A1A] placeholder:text-[#BDBDBD]"
              />
            </div>

            {/* View Layout Toggles */}
            <div className="flex border border-[#E5E5E5] bg-white p-1 gap-1 rounded-none text-xs shrink-0">
              <button
                type="button"
                onClick={() => setViewLayout("grid")}
                title="Grid Cards View"
                className={`p-1.5 transition-colors rounded-none ${
                  viewLayout === "grid"
                    ? "bg-[#1A1A1A] text-[#F9F7F2]"
                    : "text-[#52525B] hover:bg-[#F4F4F5]"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewLayout("split")}
                title="Split List View"
                className={`p-1.5 transition-colors rounded-none ${
                  viewLayout === "split"
                    ? "bg-[#1A1A1A] text-[#F9F7F2]"
                    : "text-[#52525B] hover:bg-[#F4F4F5]"
                }`}
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main vault area */}
      {mainContent}

      {/* Dialog for Grid View Detail Overlay */}
      <Dialog
        open={activeGridEntry !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setActiveGridEntry(null);
        }}
      >
        <DialogContent
          className="sm:max-w-2xl border border-[#E5E5E5] bg-white rounded-none shadow-none max-h-[85vh] overflow-y-auto"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
        >
          {activeGridEntry && (
            <div className="flex flex-col gap-6 p-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[9px] font-bold tracking-widest px-2 py-0.5 text-white ${
                      activeGridEntry.type === "concept" ? "bg-indigo-600" : "bg-emerald-600"
                    }`}
                  >
                    {activeGridEntry.type === "concept" ? "CONCEPT" : "VOCABULARY"}
                  </span>
                  <span className="text-xs text-[#8C8C8C] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Saved on {format(new Date(activeGridEntry.created_at), "MMMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-0.5">
                    <DialogTitle className="font-heading text-3xl font-bold text-[#1A1A1A]">
                      {activeGridEntry.term}
                    </DialogTitle>
                    {activeGridEntry.pronunciation && (
                      <span className="text-xs font-mono text-[#8C8C8C]">
                        {activeGridEntry.pronunciation}
                      </span>
                    )}
                  </div>
                  <button
                    disabled={isDeleting === activeGridEntry.id}
                    onClick={(e) => handleDelete(activeGridEntry.id, e)}
                    className="text-xs flex items-center gap-1 text-[#8C8C8C] hover:text-red-600 border border-[#E5E5E5] px-2.5 py-1.5 bg-white hover:bg-red-50/50 transition-colors rounded-none font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Entry
                  </button>
                </div>
              </div>

              {/* Definition Card (Serif font) */}
              <div className="bg-white border border-[#E6C79C]/40 p-6 shadow-sm relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#E6C79C]"></div>
                <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#E6C79C] mb-2">
                  Meaning / Explanation
                </h4>
                <p className="font-source-serif text-lg leading-relaxed text-[#1A1A1A] italic">
                  {activeGridEntry.definition}
                </p>
              </div>

              {/* Etymology / Origin Card */}
              {activeGridEntry.etymology && (
                <div className="bg-white border border-[#E5E5E5] p-5">
                  <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#8C8C8C] mb-2">
                    Word Origin & Etymology
                  </h4>
                  <p className="font-source-serif text-sm leading-relaxed text-[#333333] italic">
                    {activeGridEntry.etymology}
                  </p>
                </div>
              )}

              {/* Optional metadata (User Note) */}
              {activeGridEntry.user_note && (
                <div className="bg-white border border-[#E5E5E5] p-5">
                  <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#52525B] mb-2 flex items-center gap-1">
                    <BookA className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    Personal Note
                  </h4>
                  <p className="text-sm font-sans text-[#333333] leading-relaxed">
                    {activeGridEntry.user_note}
                  </p>
                </div>
              )}

              {/* Context trails (where found and what passage) */}
              {activeGridEntry.vaultTrails && activeGridEntry.vaultTrails.length > 0 && (
                <div className="flex flex-col gap-4 mt-2">
                  <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#8C8C8C] border-b border-[#E5E5E5] pb-2">
                    Context & Occurrences
                  </h4>

                  {activeGridEntry.vaultTrails.map((trail) => (
                    <div
                      key={trail.id}
                      className="bg-white border border-[#E5E5E5] p-5 flex flex-col gap-3"
                    >
                      {/* Highlighted text block */}
                      {trail.passage && (
                        <div className="relative pl-4 border-l-2 border-l-[#E5E5E5]">
                          <span className="absolute left-0 top-0 text-3xl font-serif text-[#E5E5E5] select-none -translate-x-1 -translate-y-2">
                            “
                          </span>
                          <p className="font-source-serif text-sm text-[#52525B] leading-relaxed italic pr-4">
                            {trail.passage}
                          </p>
                        </div>
                      )}

                      {/* Occurrence metadata */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#8C8C8C] pt-2 border-t border-[#F0F0F0] mt-1 font-medium">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>
                            Found in:{" "}
                            <Link
                              href={`/read/${trail.article_id}`}
                              className="text-[#1a1a1a] hover:underline"
                            >
                              {trail.article.title}
                            </Link>
                          </span>
                        </div>

                        {trail.room && (
                          <div className="flex items-center gap-1.5">
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>
                              Room:{" "}
                              <Link
                                href={`/rooms/${trail.room_id}`}
                                className="text-[#1a1a1a] hover:underline"
                              >
                                {trail.room.name}
                              </Link>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Flashcard Practice Overlay */}
      <FlashcardModal
        isOpen={practiceOpen}
        onClose={() => setPracticeOpen(false)}
        entries={filteredEntries.length > 0 ? filteredEntries : entries}
      />
    </div>
  );
}
