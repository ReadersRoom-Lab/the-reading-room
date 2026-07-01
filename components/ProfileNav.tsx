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
    window.location.hash = page === "profile" ? "" : "/security/"
  }

  const initial =
    user?.firstName?.[0] ??
    user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() ??
    "R"

  return (
    <aside className="w-64 border-r border-[#E5E5E5] bg-[#F9F7F2] shrink-0 flex flex-col overflow-y-auto">

      {/* Back link */}
      <div className="border-b border-[#E5E5E5] px-6 py-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 font-sans text-xs font-medium text-[#747878] hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          The Reading Room
        </Link>
      </div>

      {/* User identity card */}
      <div className="px-6 py-6 border-b border-[#E5E5E5]">
        <div className="w-12 h-12 bg-[#1A1A1A] flex items-center justify-center mb-4 shrink-0">
          <span className="font-heading text-lg font-bold text-[#F9F7F2]">
            {initial}
          </span>
        </div>
        <p className="font-heading text-base font-semibold text-[#1A1A1A] truncate leading-tight">
          {user?.fullName ?? user?.firstName ?? "Reader"}
        </p>
        <p className="font-sans text-xs text-[#747878] truncate mt-1">
          {user?.primaryEmailAddress?.emailAddress}
        </p>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-5 flex flex-col gap-0.5 flex-1">
        <p className="px-3 mb-2 font-sans text-[10px] font-semibold tracking-[0.14em] text-[#BDBDBD] uppercase">
          Account
        </p>

        <button
          onClick={() => navigate("profile")}
          className={`flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium text-left transition-colors w-full ${
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
          className={`flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium text-left transition-colors w-full ${
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
      <div className="px-6 py-3 border-t border-[#E5E5E5] flex items-center gap-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-40">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <span className="font-sans text-[10px] tracking-[0.06em] text-[#BDBDBD] uppercase">
          Secured by{" "}
          <a
            href="https://clerk.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#BDBDBD] hover:text-[#747878] transition-colors underline underline-offset-2"
          >
            Clerk
          </a>
        </span>
      </div>

      {/* Sign Out */}
      <div className="p-4 border-t border-[#E5E5E5]">
        <SignOutButton>
          <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#1A1A1A] text-[#F9F7F2] font-sans text-sm font-semibold transition-colors hover:bg-[#333]">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}
