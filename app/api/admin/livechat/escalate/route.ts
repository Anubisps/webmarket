import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { requireCsrf } from '@/lib/security/requireCsrf'
import { computeSlaDueAt } from '@/lib/tickets/sla'
import { sendDiscordNotification } from '@/lib/events/discord'
import type { NextRequest } from 'next/server'

export async function POST(request: Request) {
  try {
    const req = request as unknown as NextRequest
    const csrfError = await requireCsrf(req)
    if (csrfError) return csrfError

    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const admin = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!admin || !['admin', 'manager', 'support'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { sessionId } = await request.json()
    const chat = await prisma.liveChatSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
    if (!chat) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const transcript = chat.messages
      .map(m => `[${m.sender}] ${m.message}${m.attachmentName ? ` (file: ${m.attachmentName})` : ''}`)
      .join('\n')

    const visitorUser = chat.visitorEmail
      ? await prisma.user.findUnique({ where: { email: chat.visitorEmail } })
      : null

    const ticket = await prisma.ticket.create({
      data: {
        userId: visitorUser?.id || admin.id,
        subject: `Live chat escalation – ${chat.visitorName || chat.visitorId.slice(0, 8)}`,
        message: transcript || 'Escalated from live chat (no messages).',
        priority: 'high',
        status: 'open',
        slaDueAt: computeSlaDueAt('high'),
        liveChatSessionId: chat.id,
      },
    })

    await prisma.liveChatSession.update({
      where: { id: chat.id },
      data: { status: 'escalated' },
    })

    await sendDiscordNotification('ticket.escalated', {
      title: 'Live chat escalated to ticket',
      description: ticket.subject,
      fields: [{ name: 'Ticket', value: ticket.id.slice(0, 8) }],
    })

    return NextResponse.json({ ticketId: ticket.id })
  } catch (error) {
    console.error('Escalation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
