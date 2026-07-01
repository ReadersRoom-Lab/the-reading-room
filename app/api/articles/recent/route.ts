import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'

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

    const recentArticles = await prisma.article.findMany({
      where: { 
        user_id: user.id,
        status: 'in-progress' 
      },
      orderBy: { updated_at: 'desc' },
      take: 4,
      include: {
        room: true,
      }
    })

    return NextResponse.json(recentArticles)
  } catch (error) {
    logger.error('Error fetching recent articles:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
