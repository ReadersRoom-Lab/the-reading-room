"use client";

import { useState } from "react";
import { Sparkles, RotateCw, CheckCircle2 } from "lucide-react";

export interface VaultConceptCardData {
  id: string;
  term: string;
  type: string;
  definition: string;
  pronunciation?: string | null;
  etymology?: string | null;
  example_sentence?: string | null;
  user_note?: string | null;
}

interface FlashcardCueCardProps {
  concept: VaultConceptCardData;
  onMastered?: (id: string) => void;
}

export function FlashcardCueCard({ concept, onMastered }: Readonly<FlashcardCueCardProps>) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState(false);

  const handleToggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMastered(true);
    if (onMastered) onMastered(concept.id);
  };

  return (
    <button
      type="button"
      onClick={handleToggleFlip}
      aria-label="Toggle cue card flip"
      className="w-full h-[280px] cursor-pointer font-sans select-none group [perspective:1000px] border-0 p-0 bg-transparent text-left"
    >
      <div
        className={`relative w-full h-full duration-700 transition-all [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 w-full h-full bg-[#F9F7F2] border-2 border-[#E6C79C] p-6 shadow-md flex flex-col justify-between [backface-visibility:hidden]">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-[#E6C79C] text-[#1A1A1A] text-[9px] font-bold tracking-widest uppercase">
              {concept.type === "concept" ? "CONCEPT" : "VOCABULARY"}
            </span>
            {mastered ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#4E6E5D]">
                <CheckCircle2 className="w-3.5 h-3.5" /> MASTERED
              </span>
            ) : (
              <Sparkles className="w-4 h-4 text-[#E6C79C]" />
            )}
          </div>

          <div className="my-auto text-center px-2">
            <h3 className="font-heading font-bold text-2xl text-[#1A1A1A] mb-1 leading-snug">
              {concept.term}
            </h3>
            {concept.pronunciation && (
              <p className="font-mono text-xs text-[#8C8C8C]">{concept.pronunciation}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8C8C8C] border-t border-[#E5E5E5] pt-3">
            <span className="flex items-center gap-1 text-[#D17659] font-medium">
              <RotateCw className="w-3.5 h-3.5" /> Click to flip
            </span>
            <span className="text-[10px]">3D Cue Card</span>
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="absolute inset-0 w-full h-full bg-[#1A1A1A] text-[#F9F7F2] border-2 border-[#1A1A1A] p-6 shadow-lg flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="font-heading font-bold text-sm text-[#E6C79C] truncate">
              {concept.term}
            </h4>
            <span className="text-[9px] uppercase tracking-wider text-[#8C8C8C]">Definition</span>
          </div>

          <div className="my-auto overflow-y-auto max-h-[140px] pr-1 scrollbar-thin">
            <p className="font-source-serif text-xs leading-relaxed text-[#F9F7F2] mb-3">
              {concept.definition}
            </p>

            {concept.etymology && (
              <div className="bg-white/5 border-l-2 border-[#E6C79C] p-2 text-[10px] text-[#D4D4D8] italic">
                <span className="font-bold text-[#E6C79C] not-italic block mb-0.5">Origin:</span>
                {concept.etymology}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px]">
            <span className="text-white/50 text-[10px] flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-[#E6C79C]" /> Click to flip back
            </span>

            <button
              type="button"
              onClick={handleMarkMastered}
              className={`px-3 py-1 font-bold text-[10px] uppercase tracking-wider transition-all border ${
                mastered
                  ? "bg-[#4E6E5D] text-white border-[#4E6E5D]"
                  : "bg-[#E6C79C] text-[#1A1A1A] border-[#E6C79C] hover:bg-white"
              }`}
            >
              {mastered ? "Mastered" : "Mark Mastered"}
            </button>
          </div>
        </div>
      </div>
    </button>
  );
}
