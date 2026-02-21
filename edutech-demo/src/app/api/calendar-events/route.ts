import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'

export async function GET() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const events = await prisma.calendarEvent.findMany({ where: { userId: session.user.id }, orderBy: { startsAt: 'asc' } })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, startsAt, endsAt, source, module } = await req.json()
  const item = await prisma.calendarEvent.create({
    data: {
      userId: session.user.id,
      title,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      source: source || 'manual',
      module: module || null,
    },
  })
  return NextResponse.json(item)
}
