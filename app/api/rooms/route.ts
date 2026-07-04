import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

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

    const rooms = await prisma.room.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { articles: true, vaultTrails: true }
        },
        articles: {
          select: {
            _count: {
              select: { highlights: true }
            }
          }
        }
      }
    })

    return NextResponse.json(rooms)
  } catch (error) {
    logger.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

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

    const body = await req.json()
    const name = body.name
    const description = body.description
    const cover_color = body.cover_color || body.coverColor || '#F4F4F5'

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const room = await prisma.room.create({
      data: {
        user_id: user.id,
        name,
        description,
        cover_color
      }
    })

    revalidatePath('/', 'layout')
    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    logger.error('Error creating room:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
