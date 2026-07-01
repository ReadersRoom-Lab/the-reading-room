import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Bookmark, RefreshCw } from 'lucide-react'

export default async function Home() {
  const { userId } = await auth()
  const user = await prisma.user.findUnique({ where: { clerk_id: userId! } })
  
  const recentArticles = user ? await prisma.article.findMany({
    where: { user_id: user.id, status: 'in-progress' },
    orderBy: { updated_at: 'desc' },
    take: 2
  }) : []

  return (
    <div className="flex flex-col gap-12">

      {/* Page header */}
      <div className="border-b border-[#E5E5E5] pb-8">
        <h1 className="font-heading text-5xl font-bold text-[#1A1A1A] mb-2">Good day.</h1>
        <p className="font-sans text-sm text-[#747878]">Here is what awaits your attention.</p>
      </div>

      {/* Today's Rediscovery */}
      <section>
        <h2 className="font-sans text-[11px] font-medium tracking-[0.15em] text-[#747878] uppercase mb-5 flex items-center gap-2">
          <RefreshCw className="w-3 h-3" /> Today&apos;s Rediscovery
        </h2>
        <div className="border border-[#E5E5E5] bg-white p-10">
          <div className="flex justify-between items-start mb-6">
            <span className="font-sans text-[11px] font-medium px-2 py-0.5 border border-[#E6C79C] bg-[#E6C79C]/20 text-[#1A1A1A] tracking-[0.1em] uppercase">
              Vocabulary
            </span>
            <span className="font-sans text-[11px] tracking-[0.05em] text-[#747878] uppercase">30 days ago</span>
          </div>
          <h3 className="font-heading text-4xl font-bold text-[#1A1A1A] mb-3">schadenfreude</h3>
          <p className="font-serif text-xl text-[#444748] leading-relaxed mb-8">
            Pleasure derived by someone from another person&apos;s misfortune.
          </p>
          <div className="pt-5 border-t border-[#E5E5E5]">
            <p className="font-sans text-[11px] tracking-[0.05em] text-[#747878]">
              Encountered in&nbsp;
              <span className="italic font-serif text-[#1A1A1A] text-sm">&quot;The Psychology of Envy&quot;</span>
              &nbsp;›&nbsp;Chapter 4
            </p>
          </div>
        </div>
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
