"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { GlobalSearchDialog } from "@/components/GlobalSearchDialog";
import { SaveArticleDialog } from "@/components/SaveArticleDialog";
import { SidebarNav, ProfileNavLink } from "@/components/SidebarNav";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#F9F7F2] border-b border-[#E5E5E5] sticky top-0 z-40">
        <span className="font-heading font-bold text-lg text-[#1A1A1A] tracking-tight">
          ReadrSpace
        </span>
        <button
          type="button"
          onClick={toggleMenu}
          className="p-2 text-[#1A1A1A] cursor-pointer hover:bg-[#E5E5E5] rounded-md transition-colors"
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[61px] z-30 bg-[#F9F7F2] flex flex-col overflow-y-auto pb-6">
          {/* Search */}
          <div className="border-b border-[#E5E5E5] px-4 py-4">
            <GlobalSearchDialog />
          </div>

          {/* Save button */}
          <div className="border-b border-[#E5E5E5] px-4 py-4">
            <SaveArticleDialog />
          </div>

          {/* Navigation — uses SidebarNav for active-route highlighting */}
          <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
            <SidebarNav variant="mobile" onLinkClick={closeMenu} />

            <div className="my-2 border-t border-[#E5E5E5]" />

            <ProfileNavLink variant="mobile" onLinkClick={closeMenu} />
          </nav>
        </div>
      )}
    </>
  );
}
