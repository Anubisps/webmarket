import { prisma } from '@/lib/db'
import { writeAuditLog } from '@/lib/auditLog'
import { sendDiscordNotification } from '@/lib/events/discord'
import { sendRefundReceipt } from '@/lib/email'

export async function processOrderRefund(params: {
  orderId: string
  amount: number
  reason?: string
  actorEmail?: string
  actorId?: string
  partial?: boolean
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { user: { select: { email: true, username: true } } },
  })
  if (!order) throw new Error('Order not found')

  const maxRefundable = Math.max(order.total - (order.refundTotal || 0), 0)
  if (params.amount <= 0 || params.amount > maxRefundable + 0.001) {
    throw new Error(`Refund amount must be between 0.01 and ${maxRefundable.toFixed(2)}`)
  }

  const newRefundTotal = (order.refundTotal || 0) + params.amount
  const fullyRefunded = newRefundTotal >= order.total - 0.001

  const [refund, updatedOrder] = await prisma.$transaction([
    prisma.orderRefund.create({
      data: {
        orderId: order.id,
        amount: params.amount,
        reason: params.reason || null,
        createdBy: params.actorEmail || null,
        status: 'completed',
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: {
        refundTotal: newRefundTotal,
        paymentStatus: fullyRefunded ? 'refunded' : order.paymentStatus,
        status: fullyRefunded ? 'refunded' : order.status,
        fulfillmentStatus: fullyRefunded ? 'cancelled' : order.fulfillmentStatus,
      },
      include: { user: { select: { email: true, username: true } }, items: { include: { product: true } } },
    }),
  ])

  await writeAuditLog({
    userId: params.actorId,
    actorEmail: params.actorEmail,
    action: params.partial || params.amount < order.total ? 'order.refund.partial' : 'order.refund.full',
    entity: 'order',
    entityId: order.id,
    details: { amount: params.amount, reason: params.reason },
  })

  await sendRefundReceipt(updatedOrder, updatedOrder.user, params.amount)
  await sendDiscordNotification('order.refund', {
    title: fullyRefunded ? 'Full refund issued' : 'Partial refund issued',
    description: `Order #${order.id.slice(0, 8)}`,
    fields: [
      { name: 'Amount', value: `$${params.amount.toFixed(2)} USD` },
      { name: 'Customer', value: order.user.username },
    ],
  })

  return { refund, order: updatedOrder }
}
