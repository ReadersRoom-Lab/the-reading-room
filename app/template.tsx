"use client"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

export default function Template({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  
  useEffect(() => {
    // Radix UI Dialogs (used by Shadcn) sometimes fail to clean up pointer-events and aria-hidden
    // when unmounting due to a Next.js route change (e.g. clicking a link inside a search dialog).
    // This forcibly cleans them up on every page transition.
    document.body.style.pointerEvents = "";
    delete document.body.dataset.scrollLocked;
    
    // The div with .animate-page-transition is a direct child of body in the React tree (via root layout)
    // Radix targets it to hide it from screen readers when a modal opens.
    const rootElements = document.querySelectorAll("body > div");
    rootElements.forEach((el) => el.removeAttribute("aria-hidden"));
  }, [pathname]);

  return (
    <div key={pathname} className="animate-page-transition w-full min-h-screen flex flex-col">
      {children}
    </div>
  );
}
