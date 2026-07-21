"use client";

import { useState, useEffect, useMemo } from "react";
import { BookMarked, Search, BookOpen, FolderOpen, Sparkles } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FlashcardModal } from "@/components/FlashcardModal";

interface VaultTrail {
  article_id: string;
  room_id: string | null;
  article: { title: string };
  room: { name: string } | null;
}

interface VaultEntry {
  id: string;
  term: string;
  definition: string;
  pronunciation: string | null;
  etymology: string | null;
  example_sentence: string | null;
  created_at: string;
  vaultTrails: VaultTrail[];
}

// Deterministic accent colour from the first letter of the term
const ACCENT_COLOURS = [
  "#C9B8A8", // warm sand
  "#A8BFC9", // slate blue
  "#B8C9A8", // sage
  "#C9A8B8", // dusty rose
  "#C9C3A8", // warm khaki
  "#A8C9C3", // teal
];

function accentForTerm(term: string): string {
  const code = term.codePointAt(0) ?? 0;
  return ACCENT_COLOURS[code % ACCENT_COLOURS.length];
}

// ─── Skeleton card ──────────────────────────────────────────────────────────
function SkeletonCard({ delay = 0 }: { readonly delay?: number }) {
  return (
    <div
      className="bg-white border border-[#E5E5E5] flex flex-col overflow-hidden animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-1 w-full bg-[#E5E5E5]" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="h-3 w-20 bg-[#E5E5E5] rounded" />
        <div className="h-7 w-2/3 bg-[#E5E5E5] rounded" />
        <div className="h-4 w-full bg-[#E5E5E5] rounded" />
        <div className="h-4 w-5/6 bg-[#E5E5E5] rounded" />
        <div className="mt-auto h-3 w-1/2 bg-[#E5E5E5] rounded" />
      </div>
    </div>
  );
}

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

// ─── Single word card ────────────────────────────────────────────────────────
function WordCard({ entry, index }: { readonly entry: VaultEntry; readonly index: number }) {
  const accent = accentForTerm(entry.term);
  const firstTrail = entry.vaultTrails[0];
  const hasEtymology =
    entry.etymology &&
    !entry.etymology.toLowerCase().startsWith("etymology information not available");

  return (
    <div
      className="group bg-white border border-[#E5E5E5] flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Coloured top accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: accent }} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#BDBDBD]">
            {format(new Date(entry.created_at), "MMM d, yyyy")}
          </span>
          {entry.pronunciation && (
            <>
              <span className="text-[#BDBDBD] text-[10px]">·</span>
              <span className="text-[10px] text-[#52525B] font-mono bg-[#F4F3F3] px-1.5 py-0.5 rounded-sm">
                {entry.pronunciation}
              </span>
            </>
          )}
        </div>

        {/* Term */}
        <h2 className="font-heading text-[1.65rem] font-bold text-[#1A1A1A] leading-tight">
          {entry.term}
        </h2>

        {/* Definition */}
        <p className="font-source-serif text-[15px] text-[#333] leading-relaxed line-clamp-4 flex-1">
          {entry.definition}
        </p>

        {/* Example sentence */}
        {entry.example_sentence && (
          <p className="font-source-serif italic text-[#52525B] text-[13px] leading-relaxed line-clamp-2">
            &ldquo;{entry.example_sentence}&rdquo;
          </p>
        )}

        {/* Etymology */}
        {hasEtymology && (
          <div className="flex items-start gap-2 pt-1">
            <span className="shrink-0 text-[9px] font-bold tracking-[0.18em] uppercase text-[#BDBDBD] pt-0.5">
              Etym.
            </span>
            <span className="text-[11px] text-[#52525B] font-sans leading-relaxed line-clamp-2">
              {entry.etymology}
            </span>
          </div>
        )}

        {/* Source footer */}
        {firstTrail && (
          <div className="mt-auto pt-3 border-t border-[#F0EFEC] flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <BookOpen className="w-3 h-3 text-[#BDBDBD] shrink-0" />
              <Link
                href={`/read/${firstTrail.article_id}`}
                className="text-[11px] text-[#52525B] hover:text-[#1A1A1A] truncate transition-colors"
                title={firstTrail.article.title}
              >
                {firstTrail.article.title}
              </Link>
            </div>
            {firstTrail.room && (
              <div className="flex items-center gap-1.5 min-w-0">
                <FolderOpen className="w-3 h-3 text-[#BDBDBD] shrink-0" />
                <Link
                  href={`/rooms/${firstTrail.room_id}`}
                  className="text-[11px] text-[#52525B] hover:text-[#1A1A1A] truncate transition-colors"
                  title={firstTrail.room.name}
                >
                  {firstTrail.room.name}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
function renderSubtitle(loading: boolean, count: number): string {
  if (!loading && count > 0) {
    return `${count} word${count === 1 ? "" : "s"} saved`;
  }
  return "Words saved while reading, with definitions and context.";
}

export default function VaultPage() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [practiceOpen, setPracticeOpen] = useState(false);

  useEffect(() => {
    fetch("/api/vault")
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) => e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q)
    );
  }, [entries, search]);

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-8 mb-10">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#1A1A1A]">
            Vocabulary Vault
          </h1>
          <p className="text-sm text-[#52525B] mt-2 font-sans">
            {renderSubtitle(loading, entries.length)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {!loading && entries.length > 0 && (
            <Button
              onClick={() => setPracticeOpen(true)}
              className="bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none h-10 px-5 text-xs font-bold uppercase tracking-wider gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#E6C79C]" />
              Practice Flashcards
            </Button>
          )}

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#BDBDBD]" />
            <input
              id="vault-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved words…"
              aria-label="Search saved vocabulary words"
              className="w-full pl-9 pr-4 py-2 border-b border-[#BDBDBD] bg-transparent focus:outline-none focus:border-[#1A1A1A] transition-colors text-sm font-sans text-[#1A1A1A] placeholder:text-[#BDBDBD]"
            />
          </div>
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SKELETON_KEYS.map((key, i) => (
            <SkeletonCard key={key} delay={i * 60} />
          ))}
        </div>
      )}

      {/* Empty vault */}
      {!loading && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-[#E5E5E5] bg-white p-12 text-center">
          <BookMarked className="w-8 h-8 text-[#BDBDBD] mb-4" />
          <h2 className="font-heading text-2xl font-semibold text-[#1A1A1A] mb-2">
            Your Vault is empty
          </h2>
          <p className="font-sans text-sm text-[#52525B] max-w-md">
            Tap a word while reading to look it up and save it here with its full definition,
            pronunciation, and etymology.
          </p>
        </div>
      )}

      {/* No search results */}
      {!loading && entries.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[200px] border border-[#E5E5E5] bg-white p-8 text-center">
          <p className="text-sm text-[#52525B]">No words matching &ldquo;{search}&rdquo;.</p>
        </div>
      )}

      {/* Card grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
          {filtered.map((entry, i) => (
            <WordCard key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      )}

      {/* Flashcard Practice Overlay */}
      <FlashcardModal
        isOpen={practiceOpen}
        onClose={() => setPracticeOpen(false)}
        entries={filtered.length > 0 ? filtered : entries}
      />
    </div>
  );
}
