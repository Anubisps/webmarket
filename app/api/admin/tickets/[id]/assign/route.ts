import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function PUT(
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

    const { assignedTo } = await request.json()

    // Validate that the assignedTo user exists and is staff
    if (assignedTo) {
      const staff = await prisma.user.findUnique({
        where: { id: assignedTo }
      })
      if (!staff || !['admin', 'manager', 'support'].includes(staff.role)) {
        return NextResponse.json({ error: 'Invalid staff member' }, { status: 400 })
      }
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { assignedTo },
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
        },
        attachments: true
      }
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Ticket assign error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
