import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { BookMarked, Search, BookOpen, FolderOpen } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default async function VaultPage() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId }
  })

  const vaultEntries = user ? await prisma.vaultEntry.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
    include: {
      vaultTrails: {
        include: {
          article: true,
          room: true
        }
      }
    }
  }) : []

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto py-12 px-6 font-sans">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-8 mb-12">
        <h1 className="font-heading text-5xl font-bold text-[#1A1A1A]">Vocabulary Vault</h1>
        
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#BDBDBD]" />
          <input 
            type="text" 
            placeholder="Search saved concepts..." 
            className="w-full pl-9 pr-4 py-2 border-b border-[#BDBDBD] bg-transparent focus:outline-none focus:border-[#1A1A1A] transition-colors text-sm font-sans text-[#1A1A1A] placeholder:text-[#BDBDBD]"
          />
        </div>
      </div>

      {vaultEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-[#E5E5E5] bg-white p-12 text-center">
          <BookMarked className="w-8 h-8 text-[#BDBDBD] mb-4" />
          <h2 className="font-heading text-2xl font-semibold text-[#1A1A1A] mb-2">Your Vault is empty</h2>
          <p className="font-sans text-sm text-[#52525B] max-w-md">
            Highlight words while reading to save concepts, definitions, and contexts directly to your vault.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-16 relative">
          {/* Vertical timeline line */}
          <div className="absolute left-0 top-2 bottom-0 w-px bg-border -ml-4 hidden sm:block"></div>
          
          {vaultEntries.map((entry: typeof vaultEntries[0]) => {
            const firstTrail = entry.vaultTrails[0]
            
            return (
              <div key={entry.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[19px] top-3 w-2 h-2 rounded-full bg-[#1a1a1a] hidden sm:block"></div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      {entry.type === 'concept' ? 'CONCEPT' : 'VOCABULARY'}
                    </span>
                    <span className="text-muted-foreground text-[10px] uppercase">›</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {format(new Date(entry.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-heading font-bold text-[#1a1a1a] mb-4">{entry.term}</h3>
                  
                  <p className="text-[#333] font-source-serif text-[17px] leading-relaxed mb-6">
                    {entry.definition}
                  </p>
                  
                  {firstTrail && (
                    <div className="flex flex-wrap items-center gap-6 py-4 border-t border-b border-border/50 text-xs text-muted-foreground font-medium bg-[#FCFBF8]/50 px-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Found in: <Link href={`/read/${firstTrail.article_id}`} className="text-[#1a1a1a] hover:underline">{firstTrail.article.title}</Link></span>
                      </div>
                      
                      {firstTrail.room && (
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          <span>Room: <Link href={`/rooms/${firstTrail.room_id}`} className="text-[#1a1a1a] hover:underline">{firstTrail.room.name}</Link></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          
          <div className="flex justify-center mt-8">
            <button className="px-8 py-3 border border-[#1A1A1A] bg-transparent hover:bg-[#E5E5E5] text-[#1A1A1A] text-sm font-sans font-medium transition-colors">
              Load More Entries
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
