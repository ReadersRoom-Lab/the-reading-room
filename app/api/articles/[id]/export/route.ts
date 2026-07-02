import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    const article = await prisma.article.findUnique({
      where: { 
        id: id
      },
      include: {
        highlights: true,
        vaultTrails: {
          include: {
            vault_entry: true
          }
        },
        room: true
      }
    })

    if (!article || article.user_id !== user.id) {
      return new NextResponse('Article not found', { status: 404 })
    }

    let markdown = `# ${article.title}\n\n`
    if (article.author) markdown += `**Author:** ${article.author}\n`
    markdown += `**Source:** [Link](${article.source_url})\n`
    markdown += `**Saved On:** ${article.created_at.toISOString().split('T')[0]}\n`
    markdown += `**Room:** ${article.room?.name || 'Unorganized'}\n\n`
    
    markdown += `---\n\n`
    
    if (article.highlights && article.highlights.length > 0) {
      markdown += `## Highlights (${article.highlights.length})\n\n`
      article.highlights.forEach(h => {
        markdown += `> ${h.content}\n`
        if (h.note) markdown += `\n**Note:** ${h.note}\n`
        markdown += `\n---\n\n`
      })
    } else {
      markdown += `*No highlights yet.*\n\n`
    }

    if (article.vaultTrails && article.vaultTrails.length > 0) {
      markdown += `## Concepts & Insights (${article.vaultTrails.length})\n\n`
      article.vaultTrails.forEach(trail => {
        markdown += `### ${trail.vault_entry.term}\n`
        if (trail.vault_entry.definition) {
          markdown += `> ${trail.vault_entry.definition}\n\n`
        }
        if (trail.passage) {
          markdown += `**Context from article:** "${trail.passage}"\n\n`
        }
        if (trail.vault_entry.user_note) {
          markdown += `**Note:** ${trail.vault_entry.user_note}\n\n`
        }
      })
    }

    // Return as a downloadable text/markdown file
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.md"`
      }
    })

  } catch (error) {
    logger.error('Error exporting article:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
