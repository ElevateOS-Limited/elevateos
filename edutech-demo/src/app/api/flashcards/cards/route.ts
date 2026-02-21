import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const deckId = req.nextUrl.searchParams.get('deckId') || undefined

  const cards = await prisma.flashcard.findMany({
    where: { userId: session.user.id, ...(deckId ? { deckId } : {}) },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(cards)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { deckId, front, back, tags } = await req.json()
  if (!deckId || !front || !back) {
    return NextResponse.json({ error: 'deckId, front, back required' }, { status: 400 })
  }

  const card = await prisma.flashcard.create({
    data: {
      deckId,
      userId: session.user.id,
      front,
      back,
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
    },
  })

  await prisma.flashcardReview.upsert({
    where: { cardId_userId: { cardId: card.id, userId: session.user.id } },
    create: { cardId: card.id, userId: session.user.id },
    update: {},
  })

  return NextResponse.json(card)
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, front, back, tags } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const card = await prisma.flashcard.update({
    where: { id },
    data: {
      ...(front !== undefined ? { front } : {}),
      ...(back !== undefined ? { back } : {}),
      ...(Array.isArray(tags) ? { tags: tags.filter(Boolean) } : {}),
    },
  })
  return NextResponse.json(card)
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await prisma.flashcard.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
