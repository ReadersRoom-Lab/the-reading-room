"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  Library,
  LayoutGrid,
  BookMarked,
  User,
  Sparkles,
  GitFork,
} from "lucide-react";
import { GlobalSearchDialog } from "@/components/GlobalSearchDialog";
import { SaveArticleDialog } from "@/components/SaveArticleDialog";

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
          className="p-2 text-[#1A1A1A]"
          aria-label="Toggle Menu"
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

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
            <Link
              href="/home"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-3 text-base font-sans font-medium text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A] transition-colors rounded-md"
            >
              <Home className="w-5 h-5 shrink-0" /> Home
            </Link>
            <Link
              href="/library"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-3 text-base font-sans font-medium text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A] transition-colors rounded-md"
            >
              <Library className="w-5 h-5 shrink-0" /> Library
            </Link>
            <Link
              href="/rooms"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-3 text-base font-sans font-medium text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A] transition-colors rounded-md"
            >
              <LayoutGrid className="w-5 h-5 shrink-0" /> My Rooms
            </Link>
            <Link
              href="/vault"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-3 text-base font-sans font-medium text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A] transition-colors rounded-md"
            >
              <BookMarked className="w-5 h-5 shrink-0" /> Vault
            </Link>
            <Link
              href="/graph"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-3 text-base font-sans font-medium text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A] transition-colors rounded-md"
            >
              <GitFork className="w-5 h-5 shrink-0" /> Connected Ideas
            </Link>
            <Link
              href="/insights"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-3 text-base font-sans font-medium text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A] transition-colors rounded-md"
            >
              <Sparkles className="w-5 h-5 shrink-0" /> Insights
            </Link>

            <div className="my-2 border-t border-[#E5E5E5]" />

            <Link
              href="/profile"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-3 text-base font-sans font-medium text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A] transition-colors rounded-md"
            >
              <User className="w-5 h-5 shrink-0" /> Profile
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
