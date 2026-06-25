import { prisma } from '@/lib/db'
import { createUserNotification } from '@/lib/notifications'

export function billingDaysFromType(type: string, customDays?: number | null): number {
  switch (type) {
    case 'weekly': return 7
    case 'biweekly': return 14
    case 'monthly': return 30
    case 'custom':
      return Math.max(customDays || 30, 1)
    default:
      return 30
  }
}

export function subscriptionBillingLabel(type: string, intervalDays: number): string {
  switch (type) {
    case 'weekly': return 'Weekly'
    case 'biweekly': return 'Every 2 weeks'
    case 'monthly': return 'Monthly'
    case 'custom': return `Every ${intervalDays} days`
    default: return 'Monthly'
  }
}

export async function maybeCreateSubscriptionFromOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
    },
  })

  if (!order || order.subscriptionId || order.isSubscriptionRenewal) return null
  if (!order.wantsSubscription) return null

  const item = order.items[0]
  const product = item?.product
  if (!product?.subscriptionEnabled) return null

  const days = product.subscriptionIntervalDays || billingDaysFromType(product.subscriptionBillingType || 'monthly')
  const commitmentYears = order.subscriptionCommitmentYears || null
  const commitmentEndDate = commitmentYears
    ? new Date(Date.now() + commitmentYears * 365 * 24 * 60 * 60 * 1000)
    : null

  const sub = await prisma.subscription.create({
    data: {
      userId: order.userId,
      productId: product.id,
      intervalDays: days,
      price: item.price,
      nextDueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      lastOrderId: order.id,
      paymentMethod: order.paymentMethod,
      ign: order.ign,
      contactEmail: order.contactEmail,
      commitmentYears,
      commitmentEndDate,
    },
  })

  await prisma.order.update({
    where: { id: order.id },
    data: {
      subscriptionId: sub.id,
      manualSubscriptionEnabled: true,
      subscriptionIntervalDays: days,
    },
  })

  await createUserNotification(
    order.userId,
    'Subscription activated',
    commitmentYears
      ? `Your ${commitmentYears}-year subscription is active. Next billing in ${days} days.`
      : `Your subscription is active. Next billing in ${days} days.`,
    '/dashboard/subscriptions'
  )

  return sub
}
