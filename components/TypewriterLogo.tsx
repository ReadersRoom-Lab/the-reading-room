"use client"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function TypewriterLogo() {
  const [typedChars, setTypedChars] = useState(0)
  
  const line1 = "The"
  const line2 = "Reading"
  const line3 = "Rooms"
  const fullText = line1 + line2 + line3

  useEffect(() => {
    if (typedChars < fullText.length) {
      const timeout = setTimeout(() => setTypedChars(prev => prev + 1), 120)
      return () => clearTimeout(timeout)
    }
  }, [typedChars, fullText.length])

  const showCursor = (lineIndex: number, lineLength: number, startIndex: number) => {
    if (typedChars === fullText.length) return false; // Hide cursor when finished
    
    if (lineIndex < 2) {
      return typedChars >= startIndex && typedChars < startIndex + lineLength;
    } else {
      return typedChars >= startIndex && typedChars <= startIndex + lineLength;
    }
  }

  const renderLine = (text: string, startIndex: number, lineIndex: number) => {
    const cursor = showCursor(lineIndex, text.length, startIndex)
    
    return (
      <div className="flex items-center">
        <span className="font-heading text-6xl xl:text-7xl font-bold text-white drop-shadow-xl tracking-tight">
          {text.split('').map((char, index) => {
            const isVisible = startIndex + index < typedChars;
            return (
              <span key={index} className={isVisible ? "opacity-100" : "opacity-0"}>
                {char}
              </span>
            );
          })}
        </span>
        <span className={cn("w-1.5 h-[0.8em] bg-white ml-2 shadow-sm", cursor ? "animate-pulse" : "opacity-0")} />
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
