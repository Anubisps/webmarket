import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { sessionId, lastMessageId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const messages = await prisma.liveChatMessage.findMany({
      where: {
        sessionId,
        ...(lastMessageId ? { id: { gt: lastMessageId } } : {})
      },
      orderBy: { createdAt: 'asc' }
    })

    // Mark visitor messages as read (for admin)
    await prisma.liveChatMessage.updateMany({
      where: {
        sessionId,
        sender: 'visitor',
        isRead: false
      },
      data: { isRead: true }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Poll error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
