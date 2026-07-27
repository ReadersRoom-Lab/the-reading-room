"use client";

import * as React from "react";

interface TooltipProps {
  readonly children: React.ReactElement;
  readonly content: string;
  readonly side?: "top" | "bottom" | "left" | "right";
  readonly delayMs?: number;
  readonly className?: string;
}

function getPositionClass(side: NonNullable<TooltipProps["side"]>): string {
  if (side === "top") return "bottom-full mb-2 left-1/2 -translate-x-1/2";
  if (side === "bottom") return "top-full mt-2 left-1/2 -translate-x-1/2";
  if (side === "left") return "right-full mr-2 top-1/2 -translate-y-1/2";
  return "left-full ml-2 top-1/2 -translate-y-1/2";
}

function getArrowClass(side: NonNullable<TooltipProps["side"]>): string {
  if (side === "top")
    return "top-full left-1/2 -translate-x-1/2 border-t-[#1A1A1A] border-x-transparent border-b-0";
  if (side === "bottom")
    return "bottom-full left-1/2 -translate-x-1/2 border-b-[#1A1A1A] border-x-transparent border-t-0";
  if (side === "left")
    return "left-full top-1/2 -translate-y-1/2 border-l-[#1A1A1A] border-y-transparent border-r-0";
  return "right-full top-1/2 -translate-y-1/2 border-r-[#1A1A1A] border-y-transparent border-l-0";
}

/**
 * Lightweight CSS-only tooltip that wraps a single trigger element.
 * No Radix/Floating-UI dependency — uses CSS group hover with a fixed
 * delay so it feels premium without adding bundle weight.
 */
export function Tooltip({
  children,
  content,
  side = "bottom",
  delayMs = 600,
  className,
}: TooltipProps) {
  const positionClass = getPositionClass(side);
  const arrowClass = getArrowClass(side);

  return (
    <span className={`relative inline-flex group/tooltip ${className ?? ""}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute ${positionClass} z-50 whitespace-nowrap rounded-md bg-[#1A1A1A] px-2 py-1 text-[11px] font-medium text-white shadow-lg opacity-0 scale-95 transition-all duration-150 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100`}
        style={{ transitionDelay: `${delayMs}ms` }}
      >
        {content}
        {/* Arrow */}
        <span className={`absolute ${arrowClass} border-4 w-0 h-0`} />
      </span>
    </span>
  );
}
