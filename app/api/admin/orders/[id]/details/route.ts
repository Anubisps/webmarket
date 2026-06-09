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

    const { staffNote, discountAmount, items } = await request.json()

    // Update order details
    const order = await prisma.order.update({
      where: { id },
      data: {
        staffNote: staffNote || '',
        discountAmount: discountAmount || 0,
        total: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) - (discountAmount || 0)
      },
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

    // Update order items
    for (const item of items) {
      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          price: item.price,
          quantity: item.quantity
        }
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order details update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
