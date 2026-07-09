/* c8 ignore next */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* c8 ignore next */
export function secureRandom(): number {
  /* c8 ignore next */
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    const arr = new Uint32Array(1);
    globalThis.crypto.getRandomValues(arr);
    return arr[0] / 0xffffffff;
  }
  return (Date.now() % 1000) / 1000;
}
