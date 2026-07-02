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

        {/* Extension Promo */}
        <section className="bg-[#1A1A1A] text-white px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-bold mb-1 text-[#F9F7F2]">The Reading Room Extension</h2>
            <p className="font-sans text-xs text-[#BDBDBD] max-w-xl leading-relaxed">
              Save articles directly from your browser. Bypasses paywalls and anti-bot protections by saving exactly what you see.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link href="/chrome-extension" className="bg-white text-[#1A1A1A] px-4 py-2 text-[11px] font-bold tracking-[0.05em] uppercase hover:bg-[#E5E5E5] transition-colors whitespace-nowrap">
              View Instructions
            </Link>
          </div>
        </section>
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

      {/* Divider */}
      <div className="text-[#BDBDBD] font-sans text-sm tracking-widest text-center mt-6">───</div>

      {/* How to use */}
      <section>
        <h2 className="font-sans text-[11px] font-medium tracking-[0.15em] text-[#747878] uppercase mb-5">
          How to Use The Reading Room
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="border border-[#E5E5E5] bg-white p-8 hover:border-[#1A1A1A] transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center mb-6">
              <Library className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#1A1A1A] mb-3">1. Build Your Library</h3>
            <p className="font-sans text-sm text-[#747878] leading-relaxed">
              Use the Chrome Extension to save web articles with one click, bypassing paywalls. You can also manually upload PDFs or paste URLs.
            </p>
          </div>

          <div className="border border-[#E5E5E5] bg-white p-8 hover:border-[#1A1A1A] transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center mb-6">
              <Highlighter className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#1A1A1A] mb-3">2. Read & Annotate</h3>
            <p className="font-sans text-sm text-[#747878] leading-relaxed">
              Experience a minimalist, editorial reader. Highlight important passages, add personal notes, and categorize them by tags.
            </p>
          </div>

          <div className="border border-[#E5E5E5] bg-white p-8 hover:border-[#1A1A1A] transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center mb-6">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#1A1A1A] mb-3">3. Grow Your Vault</h3>
            <p className="font-sans text-sm text-[#747878] leading-relaxed">
              Select any unfamiliar word or concept while reading to look up its definition. It is automatically saved to your Vault for spaced rediscovery.
            </p>
          </div>

          <div className="border border-[#E5E5E5] bg-white p-8 hover:border-[#1A1A1A] transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center mb-6">
              <Layout className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#1A1A1A] mb-3">4. Organize into Rooms</h3>
            <p className="font-sans text-sm text-[#747878] leading-relaxed">
              Curate your knowledge by grouping related articles into thematic Rooms. Perfect for research projects or specific areas of interest.
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}
