import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({ error: 'Missing articleId parameter' }, { status: 400 })
    }

    const highlights = await prisma.highlight.findMany({
      where: {
        user_id: user.id,
        article_id: articleId
      },
      orderBy: { position_start: 'asc' }
    })

    return NextResponse.json(highlights, { status: 200 })
  } catch (error) {
    console.error('Error fetching highlights:', error)
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

    const { article_id, content, colour, note, position_start, position_end, annotation_type } = await req.json()

    if (!article_id || !content || !colour || position_start === undefined || position_end === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const highlight = await prisma.highlight.create({
      data: {
        user_id: user.id,
        article_id,
        content,
        colour,
        note,
        position_start,
        position_end,
        annotation_type
      }
    })

    return NextResponse.json(highlight, { status: 201 })
  } catch (error) {
    console.error('Error creating highlight:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
