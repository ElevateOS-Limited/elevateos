import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { recordEvent } from '@/lib/stats'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'

export async function GET(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()

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
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()

  const { title, content, tags } = await req.json()
  const normalizedTitle = typeof title === 'string' ? title.trim() : ''
  const normalizedContent = typeof content === 'string' ? content.trim() : ''

  const note = await prisma.note.create({
    data: {
      userId: session.user.id,
      title: normalizedTitle || 'Untitled Note',
      content: normalizedContent,
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
    },
  })
  await recordEvent(prisma as any, session.user.id, 'note_created', { noteId: note.id })
  return NextResponse.json(note)
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()

  const { id, title, content, tags } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const normalizedTitle = typeof title === 'string' ? title.trim() : undefined
  const normalizedContent = typeof content === 'string' ? content.trim() : undefined

  const updateResult = await prisma.note.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...(normalizedTitle !== undefined ? { title: normalizedTitle || 'Untitled Note' } : {}),
      ...(normalizedContent !== undefined ? { content: normalizedContent } : {}),
      ...(Array.isArray(tags) ? { tags: tags.filter(Boolean) } : {}),
    },
  })

  if (updateResult.count === 0) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

  const note = await prisma.note.findFirst({ where: { id, userId: session.user.id } })
  return NextResponse.json(note)
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const deleteResult = await prisma.note.deleteMany({ where: { id, userId: session.user.id } })
  if (deleteResult.count === 0) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
