import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'

export async function GET() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const goals = await prisma.goal.findMany({ where: { userId: session.user.id }, include: { deadlines: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(goals)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, description, targetDate } = await req.json()
  const goal = await prisma.goal.create({ data: { userId: session.user.id, title, description, targetDate: targetDate ? new Date(targetDate) : null } })
  return NextResponse.json(goal)
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, title, description, status, targetDate } = await req.json()
  const goal = await prisma.goal.update({ where: { id }, data: { title, description, status, targetDate: targetDate ? new Date(targetDate) : null } })
  return NextResponse.json(goal)
}
