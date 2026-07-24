import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BookMarked } from "lucide-react";
import { ExportDrawer } from "@/components/ExportDrawer";
import { LibraryContent } from "@/components/LibraryContent";
import { ShareDialog } from "@/components/ShareDialog";

export default async function LibraryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const articles = await prisma.article.findMany({
    where: { user_id: user.id },
    orderBy: { updated_at: "desc" },
  });

  const rooms = await prisma.room.findMany({
    where: { user_id: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-[#E5E5E5] pb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-5xl font-bold text-[#1A1A1A] mb-2">Library</h1>
          <p className="font-sans text-sm text-[#52525B]">Your saved articles and documents.</p>
        </div>
        <div className="flex items-center gap-3">
          <ShareDialog type="library" />
          <ExportDrawer />
        </div>
      </div>

      {articles.length > 0 ? (
        <LibraryContent initialArticles={articles} rooms={rooms} />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-[#E5E5E5] bg-white p-12 text-center">
          <BookMarked className="w-8 h-8 text-[#BDBDBD] mb-4" />
          <h2 className="font-heading text-2xl font-semibold text-[#1A1A1A] mb-2">
            Your library is empty
          </h2>
          <p className="font-sans text-sm text-[#52525B] max-w-sm">
            Save articles from the web to read them later without distractions.
          </p>
        </div>
      )}
    </div>
  );
}
