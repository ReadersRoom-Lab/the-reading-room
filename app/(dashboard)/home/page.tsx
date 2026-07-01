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
    <div className="max-w-3xl mx-auto py-12 px-6 flex flex-col gap-16 w-full">
      {/* Today's Rediscovery */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-6 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Today&apos;s Rediscovery
        </h2>
        <div className="border border-border bg-card p-8">
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs font-medium px-2 py-1 bg-secondary text-secondary-foreground uppercase tracking-widest border border-border/50">Vocabulary</span>
            <span className="text-xs text-muted-foreground">30 days ago</span>
          </div>
          <h3 className="text-3xl font-heading font-bold mb-4">schadenfreude</h3>
          <p className="text-lg text-foreground/80 mb-8 font-source-serif">Pleasure derived by someone from another person&apos;s misfortune.</p>
          <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground">
            Encountered in <span className="italic font-medium text-foreground">&quot;The Psychology of Envy&quot;</span> › Chapter 4
          </div>
        </div>
      </section>
      
      {/* Divider */}
      <div className="flex items-center justify-center text-muted-foreground gap-4">
        <div className="w-6 h-px bg-border"></div>
        <div className="w-6 h-px bg-border"></div>
        <div className="w-6 h-px bg-border"></div>
      </div>

      {/* Recently Read */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-6">Recently Read</h2>
        <div className="flex flex-col gap-4">
          {recentArticles.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border text-muted-foreground text-sm">
              You have no articles in progress. Start reading from your library!
            </div>
          ) : recentArticles.map((article: { id: string; source_type: string; title: string; reading_progress: number; read_time_minutes: number }) => (
            <Link key={article.id} href={`/read/${article.id}`} className="block border border-border bg-card p-6 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    {article.source_type === 'url' ? 'THE ATLANTIC' : 'ARTICLE'}
                  </span>
                  <Bookmark className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-8">{article.title}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1 bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${article.reading_progress}%` }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[70px] text-right">
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
