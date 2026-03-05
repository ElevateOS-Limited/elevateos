import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { recordEvent } from '@/lib/stats'

export async function GET(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const subject = req.nextUrl.searchParams.get('subject') || undefined
  const topic = req.nextUrl.searchParams.get('topic') || undefined
  const difficulty = req.nextUrl.searchParams.get('difficulty') || undefined
  const qs = await prisma.question.findMany({ where: { userId: session.user.id, ...(subject ? { subject } : {}), ...(topic ? { topic } : {}), ...(difficulty ? { difficulty } : {}) }, orderBy: { createdAt: 'desc' }, take: 100 })
  return NextResponse.json(qs)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const row = await prisma.question.create({
    data: {
      userId: session.user.id,
      subject: body.subject,
      topic: body.topic,
      difficulty: body.difficulty || 'medium',
      stem: body.stem,
      options: body.options || null,
      answer: body.answer,
      explanation: body.explanation || null,
    },
  })
  await recordEvent(prisma as any, session.user.id, 'question_created', { questionId: row.id })
  return NextResponse.json(row)
}
