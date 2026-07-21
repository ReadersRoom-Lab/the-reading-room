"use client";

import { useState, useEffect } from "react";
import { Sparkles, ChevronDown, ChevronUp, RefreshCw, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface RoomConcept {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  created_at: string;
}

interface RoomConceptsTabProps {
  readonly roomId: string;
  readonly articleCount: number;
}

interface ConceptCardProps {
  readonly concept: RoomConcept;
  readonly index: number;
}

function ConceptCard({ concept, index }: ConceptCardProps) {
  const [expanded, setExpanded] = useState(false);
  // Split on double-newlines — the prompt uses \n\n between paragraphs
  const paragraphs = concept.explanation
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div
      className="bg-white border border-[#E5E5E5] flex flex-col overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Amber left accent */}
      <div className="flex flex-1">
        <div className="w-1 shrink-0 bg-[#E6C79C]" />
        <div className="flex-1 p-6 flex flex-col">
          {/* AI badge */}
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3 h-3 text-[#E6C79C]" />
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#BDBDBD]">
              AI Synthesised
            </span>
          </div>

          <h3 className="font-heading text-xl font-bold text-[#1A1A1A] mb-2 leading-snug">
            {concept.title}
          </h3>

          <p className="font-source-serif italic text-[#52525B] text-sm leading-relaxed mb-4 flex-1">
            {concept.summary}
          </p>

          {/* Expandable explanation */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#444748] hover:text-[#1A1A1A] transition-colors self-start"
            aria-expanded={expanded}
            aria-label={
              expanded
                ? `Hide explanation for ${concept.title}`
                : `Read explanation for ${concept.title}`
            }
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Hide Explanation
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Read Explanation
              </>
            )}
          </button>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-[#E5E5E5] animate-in fade-in slide-in-from-top-1 duration-200">
              {paragraphs.map((para, i) => (
                <p
                  // para content is stable and unique enough as a key
                  key={`${concept.id}-p${i}`}
                  className="font-source-serif text-[#333] text-[16px] leading-relaxed mb-4 last:mb-0"
                >
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c", "sk-d", "sk-e", "sk-f"] as const;

function ConceptSkeleton({ delay = 0 }: { readonly delay?: number }) {
  return (
    <div
      className="bg-white border border-[#E5E5E5] flex animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-1 shrink-0 bg-[#E6C79C]/30" />
      <div className="flex-1 p-6 space-y-3">
        <div className="h-3 w-16 bg-[#E5E5E5] rounded" />
        <div className="h-5 w-2/3 bg-[#E5E5E5] rounded" />
        <div className="h-4 w-full bg-[#E5E5E5] rounded" />
        <div className="h-4 w-5/6 bg-[#E5E5E5] rounded" />
        <div className="h-4 w-3/4 bg-[#E5E5E5] rounded" />
      </div>
    </div>
  );
}

function GenerateButton({
  generating,
  hasConcepts,
  articleCount,
  onClick,
}: Readonly<{
  generating: boolean;
  hasConcepts: boolean;
  articleCount: number;
  onClick: () => void;
}>) {
  const label = hasConcepts
    ? "Regenerate concepts for this room"
    : "Generate concepts for this room";

  return (
    <Button
      onClick={onClick}
      disabled={generating}
      className="shrink-0 gap-2 bg-[#1A1A1A] text-white hover:bg-[#333] rounded-none h-10 px-5 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-60"
      aria-label={label}
    >
      {generating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Analysing {articleCount} {articleCount === 1 ? "article" : "articles"}…
        </>
      ) : (
        <>
          {hasConcepts ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {hasConcepts ? "Regenerate Concepts" : "Generate Concepts"}
        </>
      )}
    </Button>
  );
}

export function RoomConceptsTab({ roomId, articleCount }: RoomConceptsTabProps) {
  const [concepts, setConcepts] = useState<RoomConcept[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/rooms/${roomId}/concepts`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          const fetched: RoomConcept[] = data.concepts ?? [];
          setConcepts(fetched);
          if (fetched.length > 0) {
            setGeneratedAt(fetched[0].created_at);
          }
        }
      } catch (err) {
        logger.error("Failed to fetch room concepts", err);
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/concepts`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to generate concepts.");
        return;
      }
      const generated: RoomConcept[] = data.concepts ?? [];
      setConcepts(generated);
      if (generated.length > 0) setGeneratedAt(generated[0].created_at);
      toast.success(
        generated.length === 1 ? "1 concept generated." : `${generated.length} concepts generated.`
      );
    } catch (err) {
      logger.error("Concept generation failed", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Initial page load skeleton
  if (fetchLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {SKELETON_KEYS.map((key, i) => (
          <ConceptSkeleton key={key} delay={i * 80} />
        ))}
      </div>
    );
  }

  if (articleCount === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-[#E5E5E5] bg-white flex flex-col items-center gap-3">
        <BookOpen className="w-8 h-8 text-[#BDBDBD]" />
        <h3 className="font-heading text-lg font-bold text-[#1A1A1A]">No articles yet</h3>
        <p className="text-sm text-[#52525B] max-w-sm">
          Add articles to this room first. Concepts are generated by analysing the content of all
          articles in the room.
        </p>
      </div>
    );
  }

  const hasConcepts = concepts.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
        <div className="flex flex-col gap-1">
          {hasConcepts ? (
            <>
              <p className="text-sm font-semibold text-[#1A1A1A]">
                {concepts.length} {concepts.length === 1 ? "concept" : "concepts"} · synthesised
                from {articleCount} {articleCount === 1 ? "article" : "articles"}
              </p>
              {generatedAt && (
                <p className="text-[11px] text-[#BDBDBD] uppercase tracking-wider font-semibold">
                  Last generated{" "}
                  {new Date(generatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-[#52525B]">No concepts generated yet for this room.</p>
          )}
        </div>

        <GenerateButton
          generating={generating}
          hasConcepts={hasConcepts}
          articleCount={articleCount}
          onClick={handleGenerate}
        />
      </div>

      {/* Concept cards or skeletons while generating */}
      {renderConceptsArea()}
    </div>
  );

  function renderConceptsArea() {
    if (generating) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SKELETON_KEYS.map((key, i) => (
            <ConceptSkeleton key={key} delay={i * 80} />
          ))}
        </div>
      );
    }

    if (hasConcepts) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {concepts.map((concept, i) => (
            <ConceptCard key={concept.id} concept={concept} index={i} />
          ))}
        </div>
      );
    }

    return (
      <div className="py-16 text-center border border-dashed border-[#E5E5E5] bg-white flex flex-col items-center gap-3">
        <Sparkles className="w-8 h-8 text-[#BDBDBD]" />
        <h3 className="font-heading text-lg font-bold text-[#1A1A1A]">Ready to synthesise</h3>
        <p className="text-sm text-[#52525B] max-w-sm">
          Click <span className="font-semibold text-[#1A1A1A]">Generate Concepts</span> above and AI
          will extract the core ideas from your {articleCount}{" "}
          {articleCount === 1 ? "article" : "articles"}.
        </p>
      </div>
    );
  }
}
