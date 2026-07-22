"use client";

import { Tag, X } from "lucide-react";

export const PRESET_TAGS = [
  { name: "philosophy", color: "bg-[#E6C79C]/20 border-[#E6C79C] text-[#1A1A1A]" },
  { name: "ai", color: "bg-[#4F709C]/20 border-[#4F709C] text-[#4F709C]" },
  { name: "neuroscience", color: "bg-[#8DA399]/20 border-[#8DA399] text-[#8DA399]" },
  { name: "must-read", color: "bg-[#D17659]/20 border-[#D17659] text-[#D17659]" },
  { name: "research", color: "bg-[#1A1A1A]/10 border-[#1A1A1A] text-[#1A1A1A]" },
];

interface TagFilterBarProps {
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
  customTags?: string[];
}

export function TagFilterBar({
  activeTag,
  onSelectTag,
  customTags = [],
}: Readonly<TagFilterBarProps>) {
  const allTags = Array.from(new Set([...PRESET_TAGS.map((t) => t.name), ...customTags]));

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 font-sans text-xs shrink-0">
      <div className="flex items-center gap-1.5 text-[#52525B] font-semibold uppercase text-[10px] tracking-wider shrink-0 mr-1">
        <Tag className="w-3.5 h-3.5" /> Tags:
      </div>

      <button
        type="button"
        onClick={() => onSelectTag(null)}
        className={`px-3 py-1 font-medium transition-colors border ${
          activeTag === null
            ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
            : "bg-white text-[#52525B] border-[#E5E5E5] hover:border-[#1A1A1A]"
        }`}
      >
        All Tags
      </button>

      {allTags.map((tagName) => {
        const isSelected = activeTag === tagName;
        const preset = PRESET_TAGS.find((t) => t.name === tagName);
        const colorClass = preset ? preset.color : "bg-[#FAF9F5] border-[#E5E5E5] text-[#1A1A1A]";

        return (
          <button
            key={tagName}
            type="button"
            onClick={() => onSelectTag(isSelected ? null : tagName)}
            className={`px-3 py-1 font-medium transition-all border flex items-center gap-1 shrink-0 ${
              isSelected ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : colorClass
            }`}
          >
            #{tagName}
            {isSelected && <X className="w-3 h-3 ml-1" />}
          </button>
        );
      })}
    </div>
  );
}
