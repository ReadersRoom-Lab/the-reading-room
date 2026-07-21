"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function TypewriterLogo() {
  const [typedChars, setTypedChars] = useState(0);
  const fullText = "ReadrSpace";

  useEffect(() => {
    if (typedChars < fullText.length) {
      const timeout = setTimeout(() => setTypedChars((prev) => prev + 1), 120);
      return () => clearTimeout(timeout);
    }
  }, [typedChars, fullText.length]);

  return (
    <div className="flex items-center">
      <span className="font-heading text-6xl xl:text-7xl font-bold text-white drop-shadow-xl tracking-tight">
        {fullText.split("").map((char, index) => {
          const isVisible = index < typedChars;
          return (
            <span key={`${char}-${index}`} className={isVisible ? "opacity-100" : "opacity-0"}>
              {char}
            </span>
          );
        })}
      </span>
      <span
        className={cn(
          "w-1.5 h-[0.8em] bg-white ml-2 shadow-sm",
          typedChars < fullText.length ? "animate-pulse" : "opacity-0"
        )}
      />
    </div>
  );
}
