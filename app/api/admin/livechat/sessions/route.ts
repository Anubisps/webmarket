import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !['admin', 'manager', 'support'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sessions = await prisma.liveChatSession.findMany({
      where: { status: 'active' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Count unread messages per session
    const sessionsWithUnread = await Promise.all(sessions.map(async (s) => {
      const unreadCount = await prisma.liveChatMessage.count({
        where: {
          sessionId: s.id,
          sender: 'visitor',
          isRead: false
        }
      })
      return {
        ...s,
        unreadCount
      }
    }))

    return NextResponse.json(sessionsWithUnread)
  } catch (error) {
    console.error('Admin sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
