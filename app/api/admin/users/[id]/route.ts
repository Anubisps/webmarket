import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || !['admin', 'manager'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || !['admin', 'manager'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (id === admin.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.updateMany({
        where: { referredBy: id },
        data: { referredBy: null }
      })

      await tx.ticket.updateMany({
        where: { assignedTo: id },
        data: { assignedTo: null }
      })

      const affiliate = await tx.affiliate.findUnique({ where: { userId: id } })
      if (affiliate) {
        await tx.affiliateReferral.deleteMany({ where: { affiliateId: affiliate.id } })
        await tx.affiliate.delete({ where: { id: affiliate.id } })
      }

      const userOrders = await tx.order.findMany({
        where: { userId: id },
        select: { id: true }
      })
      const orderIds = userOrders.map((order) => order.id)

      const userTickets = await tx.ticket.findMany({
        where: { userId: id },
        select: { id: true }
      })
      const ticketIds = userTickets.map((ticket) => ticket.id)

      if (ticketIds.length > 0) {
        await tx.order.updateMany({
          where: { ticketId: { in: ticketIds } },
          data: { ticketId: null }
        })
      }

      if (orderIds.length > 0) {
        await tx.ticket.updateMany({
          where: { orderId: { in: orderIds } },
          data: { orderId: null }
        })
        await tx.order.updateMany({
          where: { id: { in: orderIds } },
          data: { ticketId: null }
        })
      }

      if (ticketIds.length > 0) {
        await tx.ticketAttachment.deleteMany({ where: { ticketId: { in: ticketIds } } })
        await tx.ticketReply.deleteMany({ where: { ticketId: { in: ticketIds } } })
      }

      await tx.ticketReply.deleteMany({ where: { userId: id } })
      await tx.ticketAttachment.deleteMany({ where: { userId: id } })
      await tx.ticket.deleteMany({ where: { userId: id } })

      await tx.dispute.deleteMany({ where: { userId: id } })
      if (orderIds.length > 0) {
        await tx.dispute.deleteMany({ where: { orderId: { in: orderIds } } })
        await tx.affiliateReferral.deleteMany({ where: { orderId: { in: orderIds } } })
        await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } })
      }

      await tx.order.deleteMany({ where: { userId: id } })
      await tx.review.deleteMany({ where: { userId: id } })
      await tx.notification.deleteMany({ where: { userId: id } })
      await tx.wishlistItem.deleteMany({ where: { userId: id } })
      await tx.twoFactorDevice.deleteMany({ where: { userId: id } })
      await tx.userPreference.deleteMany({ where: { userId: id } })

      await tx.user.delete({ where: { id } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
