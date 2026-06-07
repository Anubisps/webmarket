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

    const { priority } = await request.json()
    const validPriorities = ['low', 'medium', 'high']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { priority },
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
    console.error('Ticket priority update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
