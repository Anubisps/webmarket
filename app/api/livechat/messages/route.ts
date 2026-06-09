import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { sessionId, sender, message } = await request.json()

    if (!sessionId || !sender || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (!['visitor', 'admin'].includes(sender)) {
      return NextResponse.json({ error: 'Invalid sender' }, { status: 400 })
    }

    const newMessage = await prisma.liveChatMessage.create({
      data: {
        sessionId,
        sender,
        message: message.trim(),
        isRead: sender === 'admin' // Admin messages are auto-marked as read
      }
    })

    // Update session's updatedAt
    await prisma.liveChatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('Message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
