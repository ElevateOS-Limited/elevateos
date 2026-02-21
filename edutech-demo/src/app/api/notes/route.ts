import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { recordEvent } from '@/lib/stats'

export async function GET(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = (req.nextUrl.searchParams.get('q') || '').toLowerCase()
  const notes = await prisma.note.findMany({ where: { userId: session.user.id }, orderBy: { updatedAt: 'desc' } })
  const filtered = q
    ? notes.filter((n) =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q))
      )
    : notes
  return NextResponse.json(filtered)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content, tags } = await req.json()
  const note = await prisma.note.create({
    data: {
      userId: session.user.id,
      title: title || 'Untitled Note',
      content: content || '',
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
    },
  })
  await recordEvent(prisma as any, session.user.id, 'note_created', { noteId: note.id })
  return NextResponse.json(note)
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, title, content, tags } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const note = await prisma.note.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(Array.isArray(tags) ? { tags: tags.filter(Boolean) } : {}),
    },
  })
  return NextResponse.json(note)
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await prisma.note.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
