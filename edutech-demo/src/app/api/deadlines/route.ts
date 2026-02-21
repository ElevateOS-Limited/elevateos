import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'

export async function GET() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const deadlines = await prisma.deadline.findMany({ where: { userId: session.user.id }, orderBy: { dueAt: 'asc' } })
  return NextResponse.json(deadlines)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, dueAt, priority, goalId } = await req.json()
  const item = await prisma.deadline.create({ data: { userId: session.user.id, title, dueAt: new Date(dueAt), priority: priority || 'medium', goalId: goalId || null } })
  return NextResponse.json(item)
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, completed } = await req.json()
  const item = await prisma.deadline.update({ where: { id }, data: { completed: Boolean(completed) } })
  return NextResponse.json(item)
}
