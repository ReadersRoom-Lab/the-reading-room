import { SaveArticleDialog } from "@/components/SaveArticleDialog";
import { GlobalSearchDialog } from "@/components/GlobalSearchDialog";
import { Home, Library, LayoutGrid, BookMarked, User, Sparkles } from "lucide-react";
import Link from "next/link";
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
    include: {
      _count: {
        select: { rooms: true }
      }
    }
  });

  if (!user || user._count.rooms === 0) {
    redirect('/onboarding');
  }
  return (
    <div className="flex h-screen w-full bg-[#F9F7F2] overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 border-r border-[#E5E5E5] bg-[#F9F7F2] shrink-0 flex flex-col">

        {/* Brand */}
        <div className="border-b border-[#E5E5E5] px-6 py-5">
          <span className="font-heading text-base font-semibold text-[#1A1A1A] tracking-tight">
            The Reading Room
          </span>
        </div>

        {/* Search */}
        <div className="border-b border-[#E5E5E5] px-4 py-3">
          <GlobalSearchDialog />
        </div>

        {/* Save button */}
        <div className="border-b border-[#E5E5E5] px-4 py-3">
          <SaveArticleDialog />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          <Link
            href="/home"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A] transition-colors"
          >
            <Home className="w-4 h-4 shrink-0" /> Home
          </Link>
          <Link
            href="/library"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A] transition-colors"
          >
            <Library className="w-4 h-4 shrink-0" /> Library
          </Link>
          <Link
            href="/rooms"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A] transition-colors"
          >
            <LayoutGrid className="w-4 h-4 shrink-0" /> My Rooms
          </Link>
          <Link
            href="/vault"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A] transition-colors"
          >
            <BookMarked className="w-4 h-4 shrink-0" /> Vault
          </Link>
          <Link
            href="/insights"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A] transition-colors"
          >
            <Sparkles className="w-4 h-4 shrink-0" /> Insights
          </Link>
        </nav>

        {/* Profile at bottom */}
        <div className="border-t border-[#E5E5E5] px-3 py-3">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium text-[#444748] hover:bg-[#E5E5E5] hover:text-[#1A1A1A] transition-colors"
          >
            <User className="w-4 h-4 shrink-0" /> Profile
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-10 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
