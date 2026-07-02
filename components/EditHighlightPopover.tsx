import { useState } from "react"
import { Trash2, Save, X } from "lucide-react"

type HighlightType = {
  id: string
  content: string
  colour: string
  note?: string | null
  annotation_type?: string | null
}

interface EditHighlightPopoverProps {
  highlight: HighlightType
  rect: DOMRect
  onClose: () => void
  onUpdate: (id: string, data: Partial<HighlightType>) => void
  onDelete: (id: string) => void
}

const COLORS = [
  { id: "ochre", hex: "#FCD116" },
  { id: "sage", hex: "#8DA399" },
  { id: "crimson", hex: "#9A3B3B" },
  { id: "indigo", hex: "#4F709C" },
]

const TAGS = ["Insight", "To Research", "Golden Quote", "Question", "Review"]

export function EditHighlightPopover({ highlight, rect, onClose, onUpdate, onDelete }: Readonly<EditHighlightPopoverProps>) {
  const [note, setNote] = useState(highlight.note || "")
  const [annotationType, setAnnotationType] = useState(highlight.annotation_type || "")
  const [color, setColor] = useState(highlight.colour || "ochre")

  const handleSave = () => {
    onUpdate(highlight.id, {
      colour: color,
      note: note.trim() || null,
      annotation_type: annotationType || null
    })
    onClose()
  }

  if (!rect) return null

  return (
    <div 
      className="fixed z-50 bg-background border border-border shadow-xl rounded-lg p-4 w-72 animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: Math.max(20, rect.bottom + 10),
        left: Math.max(20, rect.left),
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">Edit Highlight</h4>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Colors */}
        <div className="flex gap-2">
          {COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              className={`w-6 h-6 rounded-full transition-all ${color === c.id ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-110"}`}
              style={{ backgroundColor: c.hex }}
              title={c.id}
            />
          ))}
        </div>

        {/* Tag */}
        <select 
          value={annotationType}
          onChange={(e) => setAnnotationType(e.target.value)}
          className="w-full text-sm bg-muted text-foreground rounded-md p-2 border-none outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">No Tag</option>
          {TAGS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Note */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note..."
          className="w-full text-sm bg-muted text-foreground rounded-md p-2 border-none outline-none min-h-[80px] resize-none focus:ring-1 focus:ring-ring"
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button 
            onClick={() => { onDelete(highlight.id); onClose(); }}
            className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors flex items-center gap-2 text-xs font-medium"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          
          <button 
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-xs font-medium"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </div>
  )
}
