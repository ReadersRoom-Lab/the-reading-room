import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { secureRandom } from "@/lib/utils";
import Link from "next/link";
import { Bookmark, BookOpen, Highlighter, Library, Layout } from "lucide-react";
import { TodaysRediscoveryCard } from "@/components/TodaysRediscoveryCard";

export default async function Home() {
  const { userId } = await auth();
  const user = userId ? await prisma.user.findUnique({ where: { clerk_id: userId } }) : null;

  const recentArticles = user
    ? await prisma.article.findMany({
        where: { user_id: user.id },
        orderBy: { updated_at: "desc" },
        take: 2,
      })
    : [];

  const vaultEntries = user
    ? await prisma.vaultEntry.findMany({
        where: { user_id: user.id },
        select: { id: true },
      })
    : [];

  const randomEntries =
    vaultEntries.length > 0 && user
      ? await (async () => {
          const shuffledIds = vaultEntries
            .map((e) => e.id)
            .sort(() => secureRandom() - 0.5)
            .slice(0, 8);

          const entries = await prisma.vaultEntry.findMany({
            where: { id: { in: shuffledIds } },
            include: {
              vaultTrails: {
                include: { article: true },
              },
            },
          });

          return [...entries].sort((a, b) => shuffledIds.indexOf(a.id) - shuffledIds.indexOf(b.id));
        })()
      : [];

  return (
    <div className="flex flex-col gap-10">
      {/* Page header & Promo */}
      <div className="flex flex-col gap-6">
        <div className="border-b border-[#E5E5E5] pb-6">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#1A1A1A] mb-2">
            Good day.
          </h1>
          <p className="font-sans text-sm text-[#52525B]">Here is what awaits your attention.</p>
        </div>

        {/* Hero Info Block */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* How to Use */}
          <div className="xl:col-span-2 bg-[#1A1A1A] text-white px-8 py-6">
            <h2 className="font-heading text-lg font-bold mb-5 text-[#F9F7F2]">
              How to Use ReadrSpace
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 rounded-full bg-[#333] flex items-center justify-center flex-shrink-0">
                  <Library className="w-2.5 h-2.5 text-[#F9F7F2]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#E6C79C] mb-1">
                    1. Build Your Library
                  </h3>
                  <p className="font-sans text-[11px] text-[#BDBDBD] leading-snug">
                    Save articles via our extension, upload PDFs, or paste URLs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 rounded-full bg-[#333] flex items-center justify-center flex-shrink-0">
                  <Highlighter className="w-2.5 h-2.5 text-[#F9F7F2]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#E6C79C] mb-1">
                    2. Read & Annotate
                  </h3>
                  <p className="font-sans text-[11px] text-[#BDBDBD] leading-snug">
                    Highlight passages, add notes, and read distraction-free.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 rounded-full bg-[#333] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-2.5 h-2.5 text-[#F9F7F2]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#E6C79C] mb-1">
                    3. Grow Your Vault
                  </h3>
                  <p className="font-sans text-[11px] text-[#BDBDBD] leading-snug">
                    Define unfamiliar words and save them for spaced rediscovery.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 rounded-full bg-[#333] flex items-center justify-center flex-shrink-0">
                  <Layout className="w-2.5 h-2.5 text-[#F9F7F2]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#E6C79C] mb-1">
                    4. Organize into Rooms
                  </h3>
                  <p className="font-sans text-[11px] text-[#BDBDBD] leading-snug">
                    Curate your knowledge by grouping articles into thematic Spaces.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Extension Promo */}
          <div className="bg-[#F9F7F2] border border-[#E6C79C] px-8 py-6 flex flex-col justify-center">
            <p className="font-sans text-[9px] font-medium tracking-[0.14em] text-[#BDBDBD] uppercase mb-1">
              Developer Mode Required
            </p>
            <h2 className="font-heading text-lg font-bold mb-1 text-[#1A1A1A]">
              Browser Extension
            </h2>
            <p className="font-sans text-[11px] text-[#52525B] mb-5 leading-relaxed">
              Bypass paywalls and anti-bot protections by saving exactly what you see. Requires
              Chrome Developer Mode to install.
            </p>
            <Link
              href="/extension"
              className="bg-[#1A1A1A] text-white px-4 py-2.5 text-center text-[10px] font-bold tracking-[0.05em] uppercase hover:bg-[#333] transition-colors whitespace-nowrap mt-auto"
            >
              Download Extension
            </Link>
          </div>
        </div>
      </div>

      {/* Today's Rediscovery */}
      <section>
        <TodaysRediscoveryCard
          initialItem={
            randomEntries.length > 0
              ? {
                  id: randomEntries[0].id,
                  type: "vault",
                  termOrText: randomEntries[0].term,
                  definitionOrNote: randomEntries[0].definition,
                  pronunciation: randomEntries[0].pronunciation,
                  etymology: randomEntries[0].etymology,
                  articleTitle: randomEntries[0].vaultTrails?.[0]?.article?.title,
                  articleId: randomEntries[0].vaultTrails?.[0]?.article?.id,
                  created_at: randomEntries[0].created_at.toISOString(),
                  user_note: randomEntries[0].user_note,
                }
              : null
          }
        />
      </section>

      {/* Divider */}
      <div className="text-[#BDBDBD] font-sans text-sm tracking-widest text-center">───</div>

      {/* Recently Read */}
      <section>
        <h2 className="font-sans text-[11px] font-medium tracking-[0.15em] text-[#52525B] uppercase mb-5">
          Recently Read
        </h2>
        {recentArticles.length === 0 ? (
          <div className="border border-[#E5E5E5] p-12 text-center bg-white">
            <Bookmark className="w-6 h-6 text-[#BDBDBD] mx-auto mb-3" />
            <p className="font-sans text-sm text-[#52525B]">No articles in progress.</p>
            <p className="font-sans text-xs text-[#BDBDBD] mt-1">
              Start reading from your library!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentArticles.map(
              (article: {
                id: string;
                source_type: string;
                title: string;
                reading_progress: number;
                read_time_minutes: number;
              }) => (
                <Link
                  key={article.id}
                  href={`/read/${article.id}`}
                  className="block bg-white border border-[#E5E5E5] hover:bg-[#F4F3F3] transition-colors p-6 flex flex-col justify-between h-44"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-sans text-[8px] font-semibold px-1.5 py-0.5 border border-[#E6C79C] bg-[#E6C79C]/20 text-[#1A1A1A] tracking-[0.05em] uppercase">
                        {article.source_type === "url" ? "Web Article" : "Document"}
                      </span>
                      <Bookmark className="w-3.5 h-3.5 text-[#BDBDBD]" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-[#1A1A1A] line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] mb-1.5 text-[#52525B] font-sans">
                      <span>Progress</span>
                      <span>
                        {article.reading_progress}% ·{" "}
                        {Math.max(
                          1,
                          Math.ceil(
                            article.read_time_minutes * (1 - article.reading_progress / 100)
                          )
                        )}
                        m left
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#E5E5E5] overflow-hidden">
                      <div
                        className="h-full bg-[#1A1A1A]"
                        style={{ width: `${article.reading_progress}%` }}
                      ></div>
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
