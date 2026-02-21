import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { recordEvent } from '@/lib/stats'

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subject, questionIds, answers } = await req.json()
  if (!Array.isArray(questionIds) || !questionIds.length) return NextResponse.json({ error: 'questionIds required' }, { status: 400 })

  const questions = await prisma.question.findMany({ where: { id: { in: questionIds }, userId: session.user.id } })
  const sessionRow = await prisma.practiceSession.create({ data: { userId: session.user.id, subject: subject || questions[0]?.subject || 'General' } })

  let correct = 0
  for (const q of questions) {
    const selected = answers?.[q.id]
    const isCorrect = (selected || '').toString().trim() === q.answer.toString().trim()
    if (isCorrect) correct += 1
    await prisma.practiceResult.create({ data: { sessionId: sessionRow.id, questionId: q.id, selectedAnswer: selected || null, isCorrect } })
    await recordEvent(prisma as any, session.user.id, 'question_answered', { questionId: q.id, isCorrect })
  }

  const score = questions.length ? (correct / questions.length) * 100 : 0
  await prisma.practiceSession.update({ where: { id: sessionRow.id }, data: { completedAt: new Date(), score } })
  await recordEvent(prisma as any, session.user.id, 'practice_completed', { sessionId: sessionRow.id, score })

  return NextResponse.json({ sessionId: sessionRow.id, total: questions.length, correct, score })
}
