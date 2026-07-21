import { BookOpen, Quote } from "lucide-react";

interface TextSelectionMenuProps {
  rect: DOMRect;
  onHighlight: (color: string) => void;
  onDefine: () => void;
  onSaveConcept: () => void;
}

export function TextSelectionMenu({
  rect,
  onHighlight,
  onDefine,
  onSaveConcept,
}: Readonly<TextSelectionMenuProps>) {
  if (!rect) return null;

  return (
    <div
      className="fixed z-50 bg-[#1a1a1a] shadow-lg rounded-md font-sans flex items-center p-1 gap-1 text-white animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: rect.top > 60 ? rect.top - 50 : rect.bottom + 10,
        left: rect.left + rect.width / 2 - 100, // approximate centering
      }}
    >
      <div className="flex items-center border-r border-gray-700 pr-1">
        <button
          type="button"
          onClick={() => onHighlight("ochre")}
          className="p-2 hover:bg-white/20 rounded-sm transition-colors"
          title="Highlight Ochre"
        >
          <div className="w-4 h-4 rounded-full bg-[#FCD116]" />
        </button>
        <button
          type="button"
          onClick={() => onHighlight("sage")}
          className="p-2 hover:bg-white/20 rounded-sm transition-colors"
          title="Highlight Sage"
        >
          <div className="w-4 h-4 rounded-full bg-[#8DA399]" />
        </button>
        <button
          type="button"
          onClick={() => onHighlight("crimson")}
          className="p-2 hover:bg-white/20 rounded-sm transition-colors"
          title="Highlight Crimson"
        >
          <div className="w-4 h-4 rounded-full bg-[#9A3B3B]" />
        </button>
        <button
          type="button"
          onClick={() => onHighlight("indigo")}
          className="p-2 hover:bg-white/20 rounded-sm transition-colors"
          title="Highlight Indigo"
        >
          <div className="w-4 h-4 rounded-full bg-[#4F709C]" />
        </button>
      </div>

      <button
        type="button"
        onClick={onDefine}
        className="p-2 hover:bg-white/20 rounded-sm transition-colors flex items-center gap-2 text-xs font-medium"
      >
        <BookOpen className="w-4 h-4" /> Define
      </button>

      <button
        type="button"
        onClick={onSaveConcept}
        className="p-2 hover:bg-white/20 rounded-sm transition-colors flex items-center gap-2 text-xs font-medium"
      >
        <Quote className="w-4 h-4" /> Save
      </button>
    </div>
  );
}
