import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.status === 'closed') {
      return NextResponse.json({ error: 'Cannot reply to closed ticket' }, { status: 400 })
    }

    const { message } = await request.json()
    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    await prisma.ticketReply.create({
      data: {
        ticketId: id,
        userId: user.id,
        message: message.trim()
      }
    })

    const updatedTicket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        replies: {
          include: {
            user: {
              select: { username: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        attachments: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error('Reply error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
