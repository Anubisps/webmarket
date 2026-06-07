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

    if (!user || !['admin', 'manager', 'processor'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { paymentStatus } = await request.json()
    const validStatuses = ['pending', 'paid', 'failed']
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: {
        user: {
          select: { username: true, email: true }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Payment status update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
