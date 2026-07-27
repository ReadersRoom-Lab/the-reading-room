import { SaveArticleDialog } from "@/components/SaveArticleDialog";
import { GlobalSearchDialog } from "@/components/GlobalSearchDialog";
import { SidebarNav, ProfileNavLink } from "@/components/SidebarNav";
import { MobileNav } from "@/components/MobileNav";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
    include: {
      _count: {
        select: { rooms: true },
      },
    },
  });

  if (!user || user._count.rooms === 0) {
    redirect("/onboarding");
  }
  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-[#F9F7F2] overflow-hidden">
      <MobileNav />

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-[#E5E5E5] bg-[#F9F7F2] shrink-0 flex-col">
        {/* Brand */}
        <div className="border-b border-[#E5E5E5] px-6 py-5">
          <span className="font-heading font-bold text-lg text-[#1A1A1A] tracking-tight">
            ReadrSpace
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

        {/* Navigation — client component with active route highlighting */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          <SidebarNav variant="desktop" />
        </nav>

        {/* Profile at bottom */}
        <div className="border-t border-[#E5E5E5] px-3 py-3">
          <ProfileNavLink variant="desktop" />
        </div>
      </aside>

      {/* Main content */}
      <main role="main" className="flex-1 min-w-0 overflow-y-auto bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  );
}
