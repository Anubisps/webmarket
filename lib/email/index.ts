import { Resend } from 'resend'
import { formatPriceLabel } from '@/lib/formatPrice'

const resend = new Resend(process.env.RESEND_API_KEY)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://windvault.store'

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY missing — email skipped:', subject)
    return
  }
  const { error } = await resend.emails.send({
    from: 'WindVault Market <orders@windvault.store>',
    to: [to],
    subject,
    html,
  })
  if (error) console.error('Email error:', error)
}

type OrderWithUser = {
  id: string
  total: number
  discountAmount?: number | null
  status: string
  paymentStatus: string
  paymentMethod?: string | null
  items?: { quantity: number; price: number; product: { name: string } }[]
}

type UserBasic = { email: string; username: string }

export async function sendOrderConfirmation(order: OrderWithUser, user: UserBasic) {
  const items = order.items || []
  await sendEmail(
    user.email,
    `Order placed #${order.id.slice(0, 8)}`,
    `
      <h1>Thanks ${user.username}!</h1>
      <p>Your order has been placed and is awaiting payment.</p>
      <p><strong>Order ID:</strong> #${order.id.slice(0, 8)}</p>
      <p><strong>Total:</strong> ${formatPriceLabel(order.total)}</p>
      ${order.discountAmount ? `<p><strong>Discount:</strong> -${formatPriceLabel(order.discountAmount)}</p>` : ''}
      <ul>${items.map(i => `<li>${i.product.name} × ${i.quantity} – ${formatPriceLabel(i.price)}</li>`).join('')}</ul>
      <p><a href="${siteUrl}/dashboard/orders/${order.id}">View order</a></p>
    `
  )
}

export async function sendPaymentReceipt(order: OrderWithUser, user: UserBasic) {
  await sendEmail(
    user.email,
    `Payment received #${order.id.slice(0, 8)}`,
    `
      <h1>Payment confirmed</h1>
      <p>Hi ${user.username}, we received your payment for order #${order.id.slice(0, 8)}.</p>
      <p><strong>Amount:</strong> ${formatPriceLabel(order.total)}</p>
      <p><strong>Method:</strong> ${order.paymentMethod || 'N/A'}</p>
      <p>Our team will fulfill your order shortly.</p>
      <p><a href="${siteUrl}/dashboard/orders/${order.id}">Track order</a></p>
    `
  )
}

export async function sendManualPaymentInstructions(order: OrderWithUser, user: UserBasic, instructions: string) {
  await sendEmail(
    user.email,
    `Payment instructions #${order.id.slice(0, 8)}`,
    `
      <h1>Complete your payment</h1>
      <p>Hi ${user.username}, follow these instructions to pay for order #${order.id.slice(0, 8)}.</p>
      <p><strong>Amount due:</strong> ${formatPriceLabel(order.total)}</p>
      <div style="background:#1a1a2e;padding:16px;border-radius:8px;">${instructions.replace(/\n/g, '<br>')}</div>
      <p><a href="${siteUrl}/dashboard/orders/${order.id}">View order</a></p>
    `
  )
}

export async function sendOrderFulfilled(order: OrderWithUser, user: UserBasic) {
  await sendEmail(
    user.email,
    `Order fulfilled #${order.id.slice(0, 8)}`,
    `
      <h1>Your order is ready!</h1>
      <p>Hi ${user.username}, order #${order.id.slice(0, 8)} has been fulfilled.</p>
      <p><a href="${siteUrl}/dashboard/orders/${order.id}">View details</a></p>
    `
  )
}

export async function sendRefundReceipt(order: OrderWithUser, user: UserBasic, amount: number) {
  await sendEmail(
    user.email,
    `Refund processed #${order.id.slice(0, 8)}`,
    `
      <h1>Refund issued</h1>
      <p>Hi ${user.username}, a refund of ${formatPriceLabel(amount)} was processed for order #${order.id.slice(0, 8)}.</p>
      <p><a href="${siteUrl}/dashboard/orders/${order.id}">View order</a></p>
    `
  )
}

export async function sendSubscriptionDueEmail(user: UserBasic, productName: string, dueDate: Date, subscriptionId: string) {
  await sendEmail(
    user.email,
    `Subscription renewal due – ${productName}`,
    `
      <h1>Renewal reminder</h1>
      <p>Hi ${user.username}, your subscription for <strong>${productName}</strong> is due on ${dueDate.toLocaleDateString()}.</p>
      <p>Place a manual payment order from your dashboard to continue service.</p>
      <p><a href="${siteUrl}/dashboard/subscriptions">Manage subscriptions</a></p>
    `
  )
}

export async function sendPayoutStatusEmail(user: UserBasic, amount: number, status: string) {
  await sendEmail(
    user.email,
    `Affiliate payout ${status}`,
    `
      <h1>Payout update</h1>
      <p>Hi ${user.username}, your payout request for ${formatPriceLabel(amount)} is now <strong>${status}</strong>.</p>
      <p><a href="${siteUrl}/dashboard/affiliate">Affiliate dashboard</a></p>
    `
  )
}
