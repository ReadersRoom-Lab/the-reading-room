import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

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

    const room = await prisma.room.findUnique({
      where: { 
        id: id,
        user_id: user.id
      },
      include: {
        articles: true,
        vaultTrails: {
          include: {
            vault_entry: true
          }
        }
      }
    })

    if (!room) {
      return new NextResponse('Room not found', { status: 404 })
    }

    let markdown = `# Room: ${room.name}\n\n`
    if (room.description) {
      markdown += `${room.description}\n\n`
    }
    
    markdown += `## Articles (${room.articles.length})\n\n`
    
    room.articles.forEach(article => {
      markdown += `### ${article.title}\n`
      if (article.author) markdown += `**Author:** ${article.author}\n`
      markdown += `**Source:** ${article.source_url}\n`
      markdown += `**Status:** ${article.status}\n\n`
    })

    markdown += `## Concepts & Highlights (${room.vaultTrails.length})\n\n`
    
    room.vaultTrails.forEach(trail => {
      markdown += `### ${trail.vault_entry.term}\n`
      if (trail.vault_entry.definition) {
        markdown += `> ${trail.vault_entry.definition}\n\n`
      }
      if (trail.passage) {
        markdown += `**Context:** "${trail.passage}"\n`
      }
      if (trail.vault_entry.user_note) {
        markdown += `**Note:** ${trail.vault_entry.user_note}\n`
      }
      markdown += `\n`
    })

    // Return as a downloadable text/markdown file
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${room.name.replace(/\s+/g, '_').toLowerCase()}_export.md"`
      }
    })

  } catch (error) {
    console.error('Error exporting room:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
