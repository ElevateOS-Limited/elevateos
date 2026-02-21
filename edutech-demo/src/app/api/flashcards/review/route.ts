import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { recordEvent } from '@/lib/stats'

function sm2(current: { easiness: number; interval: number; repetitions: number }, quality: number) {
  let { easiness, interval, repetitions } = current
  const q = Math.max(0, Math.min(5, quality))

  if (q < 3) {
    repetitions = 0
    interval = 1
  } else {
    repetitions += 1
    if (repetitions === 1) interval = 1
    else if (repetitions === 2) interval = 6
    else interval = Math.round(interval * easiness)
  }

  easiness = easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  if (easiness < 1.3) easiness = 1.3

  const dueDate = new Date(Date.now() + interval * 24 * 60 * 60 * 1000)
  return { easiness, interval, repetitions, dueDate }
}

export async function GET(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const deckId = req.nextUrl.searchParams.get('deckId') || undefined

  const reviews = await prisma.flashcardReview.findMany({
    where: {
      userId: session.user.id,
      dueDate: { lte: new Date() },
      ...(deckId ? { card: { deckId } } : {}),
    },
    include: { card: true },
    take: 20,
    orderBy: { dueDate: 'asc' },
  })

  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { cardId, quality } = await req.json()
  if (!cardId || quality === undefined) return NextResponse.json({ error: 'cardId and quality required' }, { status: 400 })

  const review = await prisma.flashcardReview.findUnique({
    where: { cardId_userId: { cardId, userId: session.user.id } },
  })

  const current = review || { easiness: 2.5, interval: 1, repetitions: 0 }
  const next = sm2(current, Number(quality))

  const updated = await prisma.flashcardReview.upsert({
    where: { cardId_userId: { cardId, userId: session.user.id } },
    create: {
      cardId,
      userId: session.user.id,
      ...next,
      lastScore: Number(quality),
      reviewedAt: new Date(),
    },
    update: {
      ...next,
      lastScore: Number(quality),
      reviewedAt: new Date(),
    },
  })

  await recordEvent(prisma as any, session.user.id, 'flashcard_reviewed', { cardId, quality: Number(quality) })
  return NextResponse.json(updated)
}
