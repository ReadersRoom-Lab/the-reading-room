import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Bookmark, RefreshCw, BookOpen, Highlighter, Library, Layout } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { RefreshButton } from './RefreshButton'

export default async function Home() {
  const { userId } = await auth()
  const user = await prisma.user.findUnique({ where: { clerk_id: userId! } })
  
  const recentArticles = user ? await prisma.article.findMany({
    where: { user_id: user.id },
    orderBy: { updated_at: 'desc' },
    take: 2
  }) : []

  const vaultCount = user ? await prisma.vaultEntry.count({ where: { user_id: user.id } }) : 0
  let randomVaultEntry = null
  
  if (vaultCount > 0 && user) {
    const skip = Math.floor(Math.random() * vaultCount)
    randomVaultEntry = await prisma.vaultEntry.findFirst({
      where: { user_id: user.id },
      skip,
      include: {
        vaultTrails: {
          include: { article: true }
        }
      }
    })
  }

  return (
    <div className="flex flex-col gap-10">

      {/* Page header & Promo */}
      <div className="flex flex-col gap-6">
        <div className="border-b border-[#E5E5E5] pb-6">
          <h1 className="font-heading text-5xl font-bold text-[#1A1A1A] mb-2">Good day.</h1>
          <p className="font-sans text-sm text-[#747878]">Here is what awaits your attention.</p>
        </div>

        {/* Hero Info Block */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          
          {/* How to Use */}
          <div className="xl:col-span-2 bg-[#1A1A1A] text-white p-8">
            <h2 className="font-heading text-xl font-bold mb-6 text-[#F9F7F2]">How to Use The Reading Room</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center flex-shrink-0">
                    <Library className="w-3 h-3 text-[#F9F7F2]" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#E6C79C]">1. Build Your Library</h3>
                </div>
                <p className="font-sans text-xs text-[#BDBDBD] leading-relaxed pl-9">
                  Save articles with one click using the extension, upload PDFs, or paste URLs.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center flex-shrink-0">
                    <Highlighter className="w-3 h-3 text-[#F9F7F2]" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#E6C79C]">2. Read & Annotate</h3>
                </div>
                <p className="font-sans text-xs text-[#BDBDBD] leading-relaxed pl-9">
                  Highlight important passages, add notes, and read distraction-free.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-3 h-3 text-[#F9F7F2]" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#E6C79C]">3. Grow Your Vault</h3>
                </div>
                <p className="font-sans text-xs text-[#BDBDBD] leading-relaxed pl-9">
                  Select unfamiliar words to define and save them for spaced rediscovery.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center flex-shrink-0">
                    <Layout className="w-3 h-3 text-[#F9F7F2]" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#E6C79C]">4. Organize into Rooms</h3>
                </div>
                <p className="font-sans text-xs text-[#BDBDBD] leading-relaxed pl-9">
                  Curate your knowledge by grouping related articles into thematic Spaces.
                </p>
              </div>

            </div>
          </div>

          {/* Extension Promo */}
          <div className="bg-[#F9F7F2] border border-[#E6C79C] p-8 flex flex-col justify-center">
            <h2 className="font-heading text-lg font-bold mb-2 text-[#1A1A1A]">Browser Extension</h2>
            <p className="font-sans text-xs text-[#747878] mb-6 leading-relaxed">
              The easiest way to save articles. Bypasses paywalls and anti-bot protections by saving exactly what you see on your screen.
            </p>
            <Link href="/chrome-extension" className="bg-[#1A1A1A] text-white px-4 py-3 text-center text-[11px] font-bold tracking-[0.05em] uppercase hover:bg-[#333] transition-colors whitespace-nowrap">
              View Instructions
            </Link>
          </div>

        </div>
      </div>

      {/* Today's Rediscovery */}
      <section>
        <RefreshButton />
        {randomVaultEntry ? (
          <div className="border border-[#E5E5E5] bg-white p-10">
            <div className="flex justify-between items-start mb-6">
              <span className="font-sans text-[11px] font-medium px-2 py-0.5 border border-[#E6C79C] bg-[#E6C79C]/20 text-[#1A1A1A] tracking-[0.1em] uppercase">
                {randomVaultEntry.type === 'concept' ? 'CONCEPT' : 'VOCABULARY'}
              </span>
              <span className="font-sans text-[11px] tracking-[0.05em] text-[#747878] uppercase">
                {formatDistanceToNow(new Date(randomVaultEntry.created_at), { addSuffix: true })}
              </span>
            </div>
            <h3 className="font-heading text-4xl font-bold text-[#1A1A1A] mb-3">{randomVaultEntry.term}</h3>
            <p className="font-serif text-xl text-[#444748] leading-relaxed mb-8">
              {randomVaultEntry.definition}
            </p>
            {randomVaultEntry.vaultTrails && randomVaultEntry.vaultTrails.length > 0 && (
              <div className="pt-5 border-t border-[#E5E5E5]">
                <p className="font-sans text-[11px] tracking-[0.05em] text-[#747878]">
                  {"Encountered in "}
                  <span className="italic font-serif text-[#1A1A1A] text-sm">&quot;{randomVaultEntry.vaultTrails[0].article.title}&quot;</span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-[#E5E5E5] bg-white p-10 text-center">
            <p className="font-sans text-sm text-[#747878] mb-4">Your Vault is currently empty.</p>
            <p className="font-sans text-xs text-[#BDBDBD]">Highlight and define words while reading to build your vocabulary.</p>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="text-[#BDBDBD] font-sans text-sm tracking-widest text-center">───</div>

      {/* Recently Read */}
      <section>
        <h2 className="font-sans text-[11px] font-medium tracking-[0.15em] text-[#747878] uppercase mb-5">
          Recently Read
        </h2>
        <div className="flex flex-col gap-0 border border-[#E5E5E5]">
          {recentArticles.length === 0 ? (
            <div className="p-12 text-center bg-white">
              <Bookmark className="w-6 h-6 text-[#BDBDBD] mx-auto mb-3" />
              <p className="font-sans text-sm text-[#747878]">No articles in progress.</p>
              <p className="font-sans text-xs text-[#BDBDBD] mt-1">Start reading from your library!</p>
            </div>
          ) : recentArticles.map((article: { id: string; source_type: string; title: string; reading_progress: number; read_time_minutes: number }, idx: number) => (
            <Link
              key={article.id}
              href={`/read/${article.id}`}
              className={`block bg-white hover:bg-[#F4F3F3] transition-colors p-8 ${idx > 0 ? 'border-t border-[#E5E5E5]' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-sans text-[11px] font-medium tracking-[0.1em] text-[#747878] uppercase">
                  {article.source_type === 'url' ? 'Web Article' : 'Document'}
                </span>
                <Bookmark className="w-3.5 h-3.5 text-[#BDBDBD]" />
              </div>
              <h3 className="font-heading text-2xl font-semibold text-[#1A1A1A] mb-6 leading-snug">{article.title}</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-[#E5E5E5]">
                  <div className="h-full bg-[#1A1A1A]" style={{ width: `${article.reading_progress}%` }}></div>
                </div>
                <span className="font-sans text-[11px] tracking-[0.03em] text-[#747878] whitespace-nowrap">
                  {article.reading_progress}% · {Math.max(1, Math.ceil(article.read_time_minutes * (1 - (article.reading_progress / 100))))}m left
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>


    </div>
  )
}
