import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'

export async function GET() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const [stats, notesCount, decksCount, cardsCount, dueReviews, recentEvents] = await Promise.all([
    prisma.userStats.findUnique({ where: { userId } }),
    prisma.note.count({ where: { userId } }),
    prisma.flashcardDeck.count({ where: { userId } }),
    prisma.flashcard.count({ where: { userId } }),
    prisma.flashcardReview.count({ where: { userId, dueDate: { lte: new Date() } } }),
    prisma.eventLog.findMany({ where: { userId }, take: 20, orderBy: { createdAt: 'desc' } }),
  ])

  const accuracy = stats?.totalAnswersCount ? Math.round((stats.correctAnswersCount / stats.totalAnswersCount) * 100) : 0

  return NextResponse.json({
    stats: stats || {
      currentStreakDays: 0,
      longestStreakDays: 0,
      notesCount: 0,
      flashcardsReviewed: 0,
      practiceSessionsCount: 0,
      correctAnswersCount: 0,
      totalAnswersCount: 0,
    },
    counts: { notesCount, decksCount, cardsCount, dueReviews },
    accuracy,
    recentEvents,
  })
}
