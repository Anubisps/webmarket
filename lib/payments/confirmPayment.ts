import { prisma } from '@/lib/db'
import { writeAuditLog } from '@/lib/auditLog'
import { createUserNotification } from '@/lib/notifications'
import { sendDiscordNotification } from '@/lib/events/discord'
import { sendPaymentReceipt, sendOrderFulfilled } from '@/lib/email'
import { maybeCreateSubscriptionFromOrder } from '@/lib/subscriptionFromProduct'

export async function confirmOrderPayment(params: {
  orderId: string
  transactionId?: string
  source: string
  actorEmail?: string
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      user: { select: { id: true, email: true, username: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  })

  if (!order) return { ok: false, reason: 'not_found' as const }
  if (order.paymentStatus === 'paid') return { ok: true, alreadyPaid: true as const, order }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'paid',
      status: order.status === 'cancelled' ? 'processing' : order.status === 'processing' ? 'completed' : order.status,
      transactionId: params.transactionId || order.transactionId,
      fulfillmentStatus: order.fulfillmentStatus === 'pending' ? 'processing' : order.fulfillmentStatus,
    },
    include: {
      user: { select: { id: true, email: true, username: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  })

  await writeAuditLog({
    userId: order.userId,
    actorEmail: params.actorEmail || 'system',
    action: 'payment.confirmed',
    entity: 'order',
    entityId: order.id,
    details: { source: params.source, transactionId: params.transactionId },
  })

  await sendPaymentReceipt(updated, updated.user)
  await maybeCreateSubscriptionFromOrder(order.id)
  await createUserNotification(
    order.userId,
    'Payment confirmed',
    `Your order #${order.id.slice(0, 8)} payment was confirmed.`,
    `/dashboard/orders/${order.id}`
  )
  await sendDiscordNotification('order.paid', {
    title: 'Payment confirmed',
    description: `Order #${order.id.slice(0, 8)} paid via ${params.source}`,
    fields: [
      { name: 'Customer', value: updated.user.username },
      { name: 'Total', value: `$${updated.total.toFixed(2)} USD` },
      { name: 'Method', value: updated.paymentMethod || params.source },
    ],
  })

  return { ok: true, alreadyPaid: false as const, order: updated }
}

export async function fulfillOrder(params: {
  orderId: string
  actorEmail?: string
  actorId?: string
  note?: string
}) {
  const order = await prisma.order.update({
    where: { id: params.orderId },
    data: {
      fulfillmentStatus: 'fulfilled',
      fulfilledAt: new Date(),
      staffNote: params.note?.trim() || undefined,
      status: 'completed',
    },
    include: {
      user: { select: { id: true, email: true, username: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  })

  await writeAuditLog({
    userId: params.actorId,
    actorEmail: params.actorEmail,
    action: 'order.fulfilled',
    entity: 'order',
    entityId: order.id,
  })

  await sendOrderFulfilled(order, order.user)
  await createUserNotification(
    order.user.id,
    'Order fulfilled',
    params.note?.trim()
      ? `Order #${order.id.slice(0, 8)} has been delivered. Note: ${params.note.trim()}`
      : `Order #${order.id.slice(0, 8)} has been delivered.`,
    `/dashboard/orders/${order.id}`
  )
  await sendDiscordNotification('order.fulfilled', {
    title: 'Order fulfilled',
    description: `Order #${order.id.slice(0, 8)} marked fulfilled`,
    fields: [{ name: 'Customer', value: order.user.username }],
  })

  return order
}
