"use client"

import { useUser, SignOutButton } from "@clerk/nextjs"
import Link from "next/link"
import { ArrowLeft, User, Shield, LogOut } from "lucide-react"
import { useState } from "react"

export function ProfileNav() {
  const { user } = useUser()
  const [active, setActive] = useState<"profile" | "security">("profile")

  const navigate = (page: "profile" | "security") => {
    setActive(page)
    // Clerk hash routing: '' = profile page, '/security/' = security page
    globalThis.location.hash = page === "profile" ? "" : "/security/"
  }

  const initial =
    user?.firstName?.[0] ??
    user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() ??
    "R"

  return (
    <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#E5E5E5] bg-[#F9F7F2] shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto md:overflow-x-hidden">

      {/* Back link */}
      <div className="hidden md:block border-b border-[#E5E5E5] px-6 py-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 font-sans text-xs font-medium text-[#52525B] hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          The Reading Rooms
        </Link>
      </div>

      {/* User identity card */}
      <div className="hidden md:block px-6 py-6 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded bg-[#1A1A1A] flex items-center justify-center font-serif text-white font-bold">R</div>
          <span className="font-heading font-bold text-lg text-[#1A1A1A] tracking-tight">
            The Reading Rooms
          </span>
        </div>
        <div className="w-12 h-12 bg-[#1A1A1A] flex items-center justify-center mb-4 shrink-0">
          <span className="font-heading text-lg font-bold text-[#F9F7F2]">
            {initial}
          </span>
        </div>
        <p className="font-heading text-base font-semibold text-[#1A1A1A] truncate leading-tight">
          {user?.fullName ?? user?.firstName ?? "Reader"}
        </p>
        <p className="font-sans text-xs text-[#52525B] truncate mt-1">
          {user?.primaryEmailAddress?.emailAddress}
        </p>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-3 md:px-3 md:py-5 flex flex-row md:flex-col gap-2 md:gap-0.5 items-center md:items-stretch flex-1">
        <p className="hidden md:block px-3 mb-2 font-sans text-[10px] font-semibold tracking-[0.14em] text-[#BDBDBD] uppercase">
          Account
        </p>

        <button
          onClick={() => navigate("profile")}
          className={`flex items-center justify-center md:justify-start gap-3 px-4 py-2.5 md:px-3 md:py-2.5 text-sm font-sans font-medium transition-colors w-full md:w-full ${
            active === "profile"
              ? "bg-[#E5E5E5] text-[#1A1A1A]"
              : "text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A]"
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          Profile
        </button>

        <button
          onClick={() => navigate("security")}
          className={`flex items-center justify-center md:justify-start gap-3 px-4 py-2.5 md:px-3 md:py-2.5 text-sm font-sans font-medium transition-colors w-full md:w-full ${
            active === "security"
              ? "bg-[#E5E5E5] text-[#1A1A1A]"
              : "text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A]"
          }`}
        >
          <Shield className="w-4 h-4 shrink-0" />
          Security
        </button>
      </nav>

      {/* Clerk attribution */}
      <div className="hidden md:flex px-6 py-3 border-t border-[#E5E5E5] flex items-center gap-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-40">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <span className="font-sans text-[10px] tracking-[0.06em] text-[#BDBDBD] uppercase">
          Secured by{" "}
          <a
            href="https://clerk.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#BDBDBD] hover:text-[#52525B] transition-colors underline underline-offset-2"
          >
            Clerk
          </a>
        </span>
      </div>

      {/* Sign Out */}
      <div className="p-3 md:p-4 border-t-0 md:border-t border-[#E5E5E5] shrink-0">
        <SignOutButton>
          <button className="flex items-center justify-center gap-2 w-full px-4 py-2 md:py-2.5 bg-[#1A1A1A] text-[#F9F7F2] font-sans text-sm font-semibold transition-colors hover:bg-[#333]">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline md:inline">Sign Out</span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}
