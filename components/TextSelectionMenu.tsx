import { BookOpen, Quote } from "lucide-react"

interface TextSelectionMenuProps {
  rect: DOMRect
  onHighlight: (color: string) => void
  onDefine: () => void
  onSaveConcept: () => void
}

export function TextSelectionMenu({ rect, onHighlight, onDefine, onSaveConcept }: Readonly<TextSelectionMenuProps>) {
  if (!rect) return null

  return (
    <div 
      className="fixed z-50 bg-[#1a1a1a] shadow-lg rounded-md font-sans flex items-center p-1 gap-1 text-white animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: rect.top > 60 ? rect.top - 50 : rect.bottom + 10,
        left: rect.left + (rect.width / 2) - 100, // approximate centering
      }}
    >
      <div className="flex items-center border-r border-gray-700 pr-1">
        <button 
          onClick={() => onHighlight('yellow')}
          className="p-2 hover:bg-white/20 rounded-sm transition-colors"
          title="Highlight Yellow"
        >
          <div className="w-4 h-4 rounded-full bg-yellow-400" />
        </button>
        <button 
          onClick={() => onHighlight('green')}
          className="p-2 hover:bg-white/20 rounded-sm transition-colors"
          title="Highlight Green"
        >
          <div className="w-4 h-4 rounded-full bg-green-400" />
        </button>
        <button 
          onClick={() => onHighlight('blue')}
          className="p-2 hover:bg-white/20 rounded-sm transition-colors"
          title="Highlight Blue"
        >
          <div className="w-4 h-4 rounded-full bg-blue-400" />
        </button>
      </div>
      
      <button 
        onClick={onDefine}
        className="p-2 hover:bg-white/20 rounded-sm transition-colors flex items-center gap-2 text-xs font-medium"
      >
        <BookOpen className="w-4 h-4" /> Define
      </button>
      
      <button 
        onClick={onSaveConcept}
        className="p-2 hover:bg-white/20 rounded-sm transition-colors flex items-center gap-2 text-xs font-medium"
      >
        <Quote className="w-4 h-4" /> Save
      </button>
    </div>
  )
}
