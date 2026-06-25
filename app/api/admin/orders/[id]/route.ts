import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { requireCsrf } from '@/lib/security/requireCsrf'
import { writeAuditLog } from '@/lib/auditLog'
import type { NextRequest } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { username: true, email: true }
        },
        items: {
          include: {
            product: true
          }
        },
        ticket: { select: { id: true, status: true } },
        refunds: { orderBy: { createdAt: 'desc' } },
        subscription: true,
      }
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const req = request as unknown as NextRequest
    const csrfError = await requireCsrf(req)
    if (csrfError) return csrfError

    const { id } = await params
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!admin || !['admin', 'manager'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, affiliateReferrals: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }

      for (const ref of order.affiliateReferrals) {
        await tx.affiliate.update({
          where: { id: ref.affiliateId },
          data: { balance: { decrement: ref.commission } },
        })
      }

      await tx.affiliateReferral.deleteMany({ where: { orderId: id } })
      await tx.dispute.deleteMany({ where: { orderId: id } })
      await tx.ticket.updateMany({ where: { orderId: id }, data: { orderId: null } })

      if (order.subscriptionId) {
        await tx.subscription.update({
          where: { id: order.subscriptionId },
          data: { status: 'cancelled' },
        })
      }

      await tx.orderItem.deleteMany({ where: { orderId: id } })
      await tx.order.delete({ where: { id } })
    })

    await writeAuditLog({
      userId: admin.id,
      actorEmail: admin.email,
      action: 'order.deleted',
      entity: 'order',
      entityId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
