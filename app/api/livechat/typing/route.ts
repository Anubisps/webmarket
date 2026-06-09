import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { sessionId, isTyping } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    await prisma.liveChatSession.update({
      where: { id: sessionId },
      data: { isTyping: isTyping === true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Typing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
