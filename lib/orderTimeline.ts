export type TimelineStep = {
  key: string
  label: string
  description?: string
  at?: Date | null
  status: 'done' | 'current' | 'pending' | 'skipped'
}

type OrderLike = {
  createdAt: Date
  paymentStatus: string
  status: string
  fulfillmentStatus: string
  fulfilledAt: Date | null
  refundTotal: number
}

export function buildOrderTimeline(order: OrderLike): TimelineStep[] {
  const paid = ['paid', 'refunded'].includes(order.paymentStatus)
  const fulfilled = order.fulfillmentStatus === 'fulfilled'
  const cancelled = order.status === 'cancelled'
  const refunded = order.refundTotal > 0 || order.paymentStatus === 'refunded'

  const steps: TimelineStep[] = [
    {
      key: 'placed',
      label: 'Order placed',
      at: order.createdAt,
      status: 'done',
    },
    {
      key: 'payment',
      label: paid ? 'Payment confirmed' : 'Awaiting payment',
      description: paid ? undefined : 'Complete payment or contact support with proof',
      at: paid ? order.createdAt : null,
      status: cancelled ? 'skipped' : paid ? 'done' : 'current',
    },
    {
      key: 'processing',
      label: 'Processing',
      description: 'We are preparing your order',
      status: cancelled ? 'skipped' : fulfilled ? 'done' : paid ? 'current' : 'pending',
    },
    {
      key: 'fulfilled',
      label: fulfilled ? 'Delivered / fulfilled' : 'Fulfillment pending',
      at: order.fulfilledAt,
      status: cancelled ? 'skipped' : fulfilled ? 'done' : paid ? 'pending' : 'pending',
    },
  ]

  if (refunded) {
    steps.push({
      key: 'refund',
      label: 'Refund issued',
      description: `$${order.refundTotal.toFixed(2)} refunded`,
      status: 'done',
    })
  }

  if (cancelled) {
    steps.push({ key: 'cancelled', label: 'Order cancelled', status: 'done' })
  }

  return steps
}
