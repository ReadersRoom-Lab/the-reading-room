import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { term, definition, passage, article_id, room_id, type, user_note } = await req.json()

    if (!term || !article_id || !passage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if vault entry already exists for this term and user
    let vaultEntry = await prisma.vaultEntry.findFirst({
      where: { 
        user_id: user.id,
        term: { equals: term, mode: 'insensitive' }
      }
    })

    if (!vaultEntry) {
      vaultEntry = await prisma.vaultEntry.create({
        data: {
          user_id: user.id,
          term,
          type: type || 'concept',
          definition: definition || '',
          user_note
        }
      })
    }

    // Create the trail
    const trail = await prisma.vaultTrail.create({
      data: {
        vault_entry_id: vaultEntry.id,
        article_id,
        room_id,
        passage
      }
    })

    return NextResponse.json({ vaultEntry, trail }, { status: 201 })
  } catch (error) {
    console.error('Error creating vault entry:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const vaultEntries = await prisma.vaultEntry.findMany({
      where: { user_id: user.id },
      include: {
        vaultTrails: {
          include: {
            article: true,
            room: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(vaultEntries, { status: 200 })
  } catch (error) {
    console.error('Error fetching vault entries:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
