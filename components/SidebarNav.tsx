"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, LayoutGrid, BookMarked, User, Sparkles, GitFork } from "lucide-react";

const NAV_LINKS = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/library", label: "Library", Icon: Library },
  { href: "/rooms", label: "My Rooms", Icon: LayoutGrid },
  { href: "/vault", label: "Vault", Icon: BookMarked },
  { href: "/graph", label: "Connected Ideas", Icon: GitFork },
  { href: "/insights", label: "Insights", Icon: Sparkles },
];

interface SidebarNavProps {
  /** "desktop" renders compact sidebar links; "mobile" renders larger touch-friendly links */
  variant?: "desktop" | "mobile";
  onLinkClick?: () => void;
}

export function SidebarNav({ variant = "desktop", onLinkClick }: Readonly<SidebarNavProps>) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <>
        {NAV_LINKS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-3 py-3 text-base font-sans font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-[#1A1A1A] text-[#F9F7F2]"
                  : "text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A]"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" /> {label}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <>
      {NAV_LINKS.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium rounded-sm transition-colors ${
              isActive
                ? "bg-[#1A1A1A] text-[#F9F7F2]"
                : "text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A]"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" /> {label}
          </Link>
        );
      })}
    </>
  );
}

export function ProfileNavLink({
  variant = "desktop",
  onLinkClick,
}: Readonly<{
  variant?: "desktop" | "mobile";
  onLinkClick?: () => void;
}>) {
  const pathname = usePathname();
  const isActive = pathname === "/profile";

  if (variant === "mobile") {
    return (
      <Link
        href="/profile"
        onClick={onLinkClick}
        className={`flex items-center gap-3 px-3 py-3 text-base font-sans font-medium rounded-md transition-colors ${
          isActive
            ? "bg-[#1A1A1A] text-[#F9F7F2]"
            : "text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A]"
        }`}
      >
        <User className="w-5 h-5 shrink-0" /> Profile
      </Link>
    );
  }

  return (
    <Link
      href="/profile"
      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium rounded-sm transition-colors ${
        isActive
          ? "bg-[#1A1A1A] text-[#F9F7F2]"
          : "text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A]"
      }`}
    >
      <User className="w-4 h-4 shrink-0" /> Profile
    </Link>
  );
}
