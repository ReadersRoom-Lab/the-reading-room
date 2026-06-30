import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET() {
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

  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()

  // Only allow updating name and tier for now
  const allowedData: any = {}
  if (data.name) allowedData.name = data.name
  if (data.tier) allowedData.tier = data.tier

  const user = await prisma.user.update({
    where: { clerk_id: userId },
    data: allowedData,
  })

  return NextResponse.json(user)
}
