import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { notifyStaffNewTicket } from '@/lib/notifications'

export async function POST(request: Request) {
  try {
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

    const { subject, message, orderId } = await request.json()

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    // If orderId is provided, check if a ticket already exists for this order
    if (orderId) {
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          ticket: true
        }
      })
      if (!existingOrder) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      if (existingOrder.ticket) {
        return NextResponse.json({ error: 'Ticket already exists for this order' }, { status: 400 })
      }
    }

    // Create the ticket (this already links the order via orderId)
    const ticket = await prisma.ticket.create({
      data: {
        userId: user.id,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
        priority: 'medium',
        orderId: orderId || null
      },
      include: {
        user: {
          select: { username: true }
        }
      }
    })

    await notifyStaffNewTicket(ticket)

    return NextResponse.json({ success: true, ticketId: ticket.id })
  } catch (error) {
    console.error('Ticket creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
