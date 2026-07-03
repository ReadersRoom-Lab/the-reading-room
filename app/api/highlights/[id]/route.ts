import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params

    const highlight = await prisma.highlight.findUnique({
      where: { id }
    })

    if (!highlight) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 })
    }

    if (highlight.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.highlight.delete({
      where: { id }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    logger.error('Error deleting highlight:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params

    const highlight = await prisma.highlight.findUnique({
      where: { id }
    })

    if (!highlight) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 })
    }

    if (highlight.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { colour, note, annotation_type } = body

    const updated = await prisma.highlight.update({
      where: { id },
      data: {
        colour,
        note,
        annotation_type
      }
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    logger.error('Error updating highlight:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
