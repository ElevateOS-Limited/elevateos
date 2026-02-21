import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'

export async function GET() {
  const list = await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  const { email, category, message } = await req.json()
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 })
  const row = await prisma.feedback.create({
    data: {
      userId: session?.user?.id || null,
      email: email || null,
      category: category || 'general',
      message,
    },
  })
  return NextResponse.json(row)
}
