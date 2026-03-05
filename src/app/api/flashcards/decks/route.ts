import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'

export async function GET() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const decks = await prisma.flashcardDeck.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { cards: true } } },
  })
  return NextResponse.json(decks)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, description } = await req.json()
  const deck = await prisma.flashcardDeck.create({
    data: { userId: session.user.id, name: name || 'New Deck', description: description || null },
  })
  return NextResponse.json(deck)
}
