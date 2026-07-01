import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const article = await prisma.article.findUnique({
      where: { id: id }
    })

    if (!article || article.user_id !== user.id) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (error) {
    logger.error("Error fetching article:", error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const articleCheck = await prisma.article.findUnique({
      where: { id: id }
    })

    if (!articleCheck || articleCheck.user_id !== user.id) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const { reading_progress, status } = await req.json()

    const article = await prisma.article.update({
      where: { id: id },
      data: {
        ...(reading_progress !== undefined && { reading_progress }),
        ...(status !== undefined && { status }),
      }
    })

    return NextResponse.json(article)
  } catch (error) {
    logger.error("Error updating article:", error)
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const article = await prisma.article.findUnique({
      where: { id: id }
    })

    if (!article || article.user_id !== user.id) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    await prisma.article.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error deleting article:", error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}
