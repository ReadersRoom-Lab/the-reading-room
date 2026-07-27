import { BookOpen, Quote } from "lucide-react";

interface TextSelectionMenuProps {
  rect: DOMRect;
  onHighlight: (color: string) => void;
  onDefine: () => void;
  onSaveConcept: () => void;
}

const MENU_WIDTH = 240;
const MENU_HEIGHT = 48;

export function TextSelectionMenu({
  rect,
  onHighlight,
  onDefine,
  onSaveConcept,
}: Readonly<TextSelectionMenuProps>) {
  if (!rect) return null;

  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  // Horizontal: center on selection, clamped to viewport edges with 8px margin
  const rawLeft = rect.left + rect.width / 2 - MENU_WIDTH / 2;
  const clampedLeft = Math.max(8, Math.min(rawLeft, viewportWidth - MENU_WIDTH - 8));

  // Vertical: prefer above the selection, fallback to below
  const topAbove = rect.top - MENU_HEIGHT - 8;
  const topBelow = rect.bottom + 8;
  const top = topAbove >= 8 ? topAbove : Math.min(topBelow, viewportHeight - MENU_HEIGHT - 8);

  return (
    <div
      className="fixed z-50 bg-[#1a1a1a] shadow-lg rounded-md font-sans flex items-center p-1 gap-1 text-white animate-in fade-in zoom-in-95 duration-100"
      style={{
        top,
        left: clampedLeft,
        width: MENU_WIDTH,
      }}
    >
      <div className="flex items-center border-r border-gray-700 pr-1">
        <button
          type="button"
          onClick={() => onHighlight("ochre")}
          className="p-2 hover:bg-white/20 rounded-sm transition-colors cursor-pointer"
          title="Highlight Ochre"
        >
          <div className="w-4 h-4 rounded-full bg-[#FCD116]" />
        </button>
        <button
          type="button"
          onClick={() => onHighlight("sage")}
          className="p-2 hover:bg-white/20 rounded-sm transition-colors cursor-pointer"
          title="Highlight Sage"
        >
          <div className="w-4 h-4 rounded-full bg-[#8DA399]" />
        </button>
        <button
          type="button"
          onClick={() => onHighlight("crimson")}
          className="p-2 hover:bg-white/20 rounded-sm transition-colors cursor-pointer"
          title="Highlight Crimson"
        >
          <div className="w-4 h-4 rounded-full bg-[#9A3B3B]" />
        </button>
        <button
          type="button"
          onClick={() => onHighlight("indigo")}
          className="p-2 hover:bg-white/20 rounded-sm transition-colors cursor-pointer"
          title="Highlight Indigo"
        >
          <div className="w-4 h-4 rounded-full bg-[#4F709C]" />
        </button>
      </div>

      <button
        type="button"
        onClick={onDefine}
        className="p-2 hover:bg-white/20 rounded-sm transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer flex-1 justify-center"
      >
        <BookOpen className="w-4 h-4 shrink-0" /> Define
      </button>

      <button
        type="button"
        onClick={onSaveConcept}
        className="p-2 hover:bg-white/20 rounded-sm transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer flex-1 justify-center"
      >
        <Quote className="w-4 h-4 shrink-0" /> Save
      </button>
    </div>
  );
}
