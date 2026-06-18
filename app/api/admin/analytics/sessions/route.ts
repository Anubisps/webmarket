import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user || !['admin', 'manager'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get all sessions with their latest activity
  const sessions = await prisma.analyticsEvent.groupBy({
    by: ['sessionId'],
    where: { sessionId: { not: null } },
    _count: { id: true },
    _max: { timestamp: true },
    _min: { timestamp: true },
  })

  // Get the full events for each session
  const sessionsWithEvents = await Promise.all(
    sessions.map(async (s) => {
      const events = await prisma.analyticsEvent.findMany({
        where: { sessionId: s.sessionId! },
        orderBy: { timestamp: 'asc' },
        select: {
          id: true,
          path: true,
          timestamp: true,
          ip: true,
          userAgent: true,
          referer: true,
          eventType: true,
          element: true,
        }
      })

      const lastActivity = s._max.timestamp
      const isActive = lastActivity && (new Date().getTime() - new Date(lastActivity).getTime()) < 15 * 60 * 1000 // 15 min

      return {
        sessionId: s.sessionId,
        eventCount: s._count.id,
        firstSeen: s._min.timestamp,
        lastSeen: lastActivity,
        isActive,
        events,
      }
    })
  )

  // Sort active sessions first
  sessionsWithEvents.sort((a, b) => {
    if (a.isActive && !b.isActive) return -1
    if (!a.isActive && b.isActive) return 1
    return new Date(b.lastSeen!).getTime() - new Date(a.lastSeen!).getTime()
  })

  return NextResponse.json(sessionsWithEvents)
}
