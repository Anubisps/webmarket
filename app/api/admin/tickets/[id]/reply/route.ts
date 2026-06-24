import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { notifyUserTicketReply } from '@/lib/notifications'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { message } = await request.json()
    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const ticketBeforeReply = await prisma.ticket.findUnique({
      where: { id },
      select: { userId: true, subject: true },
    })

    await prisma.ticketReply.create({
      data: {
        ticketId: id,
        userId: user.id,
        message: message.trim()
      }
    })

    // Optionally update ticket status to 'in-progress'
    await prisma.ticket.update({
      where: { id },
      data: { status: 'in-progress' }
    })

    if (ticketBeforeReply) {
      await notifyUserTicketReply(id, ticketBeforeReply.userId, ticketBeforeReply.subject)
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: { username: true, email: true }
        },
        replies: {
          include: {
            user: {
              select: { username: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Ticket reply error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
