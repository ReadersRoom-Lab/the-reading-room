import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Library } from "lucide-react";
import { CreateRoomDialog } from "@/components/CreateRoomDialog";
import { format } from "date-fns";

type RoomWithCounts = {
  id: string;
  name: string;
  cover_color: string;
  mode: string;
  created_at: Date;
  _count: {
    articles: number;
    vaultTrails: number;
  };
  articles: {
    _count: {
      highlights: number;
    };
  }[];
};

export default async function RoomsPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
  });

  const rooms: RoomWithCounts[] = user
    ? await prisma.room.findMany({
        where: { user_id: user.id },
        orderBy: { created_at: "desc" },
        include: {
          _count: {
            select: { articles: true, vaultTrails: true },
          },
          articles: {
            select: {
              _count: {
                select: { highlights: true },
              },
            },
          },
        },
      })
    : [];

  return (
    <div className="flex flex-col gap-10">
      <div className="border-b border-[#E5E5E5] pb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#1A1A1A] mb-2">
            My Rooms
          </h1>
          <p className="font-sans text-sm text-[#52525B]">
            Manage your intellectual environments and curated research clusters.
          </p>
        </div>
        <div className="shrink-0">
          <CreateRoomDialog />
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-[#E5E5E5] bg-white p-12 text-center">
          <Library className="w-8 h-8 text-[#BDBDBD] mb-4" />
          <h2 className="font-heading text-2xl font-semibold text-[#1A1A1A] mb-2">
            No rooms created yet
          </h2>
          <p className="font-sans text-sm text-[#52525B] max-w-md">
            Rooms are themed shelves where you can organize your saved articles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rooms.map((room) => {
            const highlightsCount = room.articles.reduce(
              (acc, curr) => acc + curr._count.highlights,
              0
            );
            const isResearch =
              room.mode === "research" ||
              room.name.toLowerCase().includes("thesis") ||
              room.name.toLowerCase().includes("ethics") ||
              room.name.toLowerCase().includes("learning");

            return (
              <Link key={room.id} href={`/rooms/${room.id}`} className="block">
                <div className="flex flex-col bg-white hover:bg-[#F4F3F3] transition-colors overflow-hidden border border-[#E5E5E5]">
                  {/* Room color strip */}
                  <div className="h-1 w-full" style={{ backgroundColor: room.cover_color }}></div>

                  <div className="p-6 sm:p-8">
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-sans text-[11px] font-medium tracking-[0.15em] text-[#52525B] uppercase">
                        {isResearch ? "Research Room" : "Reading Room"}
                      </span>
                      <span className="font-sans text-[11px] tracking-[0.05em] text-[#52525B]">
                        {format(new Date(room.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>

                    <h2 className="font-heading text-3xl font-semibold text-[#1A1A1A] mb-8 leading-snug">
                      {room.name}
                    </h2>

                    <div className="flex items-center gap-8 border-t border-[#E5E5E5] pt-4">
                      <div>
                        <p className="font-sans text-[11px] tracking-[0.05em] text-[#52525B] uppercase mb-0.5">
                          Articles
                        </p>
                        <p className="font-sans text-base font-semibold text-[#1A1A1A]">
                          {room._count.articles}
                        </p>
                      </div>
                      <div>
                        <p className="font-sans text-[11px] tracking-[0.05em] text-[#52525B] uppercase mb-0.5">
                          Highlights
                        </p>
                        <p className="font-sans text-base font-semibold text-[#1A1A1A]">
                          {highlightsCount}
                        </p>
                      </div>
                      <div>
                        <p className="font-sans text-[11px] tracking-[0.05em] text-[#52525B] uppercase mb-0.5">
                          Vault
                        </p>
                        <p className="font-sans text-base font-semibold text-[#1A1A1A]">
                          {room._count.vaultTrails}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
