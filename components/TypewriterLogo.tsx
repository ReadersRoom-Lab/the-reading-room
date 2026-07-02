"use client"
import { useState, useEffect } from "react"

export function TypewriterLogo() {
  const [typedChars, setTypedChars] = useState(0)
  
  const line1 = "The"
  const line2 = "Reading"
  const line3 = "Room"
  const fullText = line1 + line2 + line3

  useEffect(() => {
    if (typedChars < fullText.length) {
      const timeout = setTimeout(() => setTypedChars(prev => prev + 1), 70)
      return () => clearTimeout(timeout)
    }
  }, [typedChars, fullText.length])

  const showCursor = (lineIndex: number, lineLength: number, startIndex: number) => {
    const isTypingThisLine = typedChars >= startIndex && typedChars <= startIndex + lineLength;
    const isFinished = typedChars === fullText.length;
    
    if (lineIndex === 2 && isFinished) return true; // Keep blinking on last line
    return isTypingThisLine && typedChars !== fullText.length || (lineIndex === 2 && isFinished);
  }

  const renderLine = (text: string, startIndex: number, lineIndex: number) => {
    const charsToShow = Math.max(0, Math.min(typedChars - startIndex, text.length))
    const displayedText = text.substring(0, charsToShow)
    const cursor = showCursor(lineIndex, text.length, startIndex)
    
    return (
      <div className="flex items-center min-h-[1.2em]">
        <span className="font-heading text-6xl xl:text-7xl font-bold text-white drop-shadow-xl tracking-tight">
          {displayedText}
        </span>
        {cursor && (
          <span className="w-1.5 h-[0.8em] bg-white ml-2 animate-pulse shadow-sm" />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {renderLine(line1, 0, 0)}
      {renderLine(line2, line1.length, 1)}
      {renderLine(line3, line1.length + line2.length, 2)}
    </div>
  )
}
