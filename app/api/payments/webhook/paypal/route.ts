import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseConfig } from '@/lib/payments/processor'
import { confirmOrderPayment } from '@/lib/payments/confirmPayment'

async function getPayPalToken(clientId: string, clientSecret: string) {
  const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await tokenRes.json()
  if (!tokenRes.ok) throw new Error('PayPal auth failed')
  return data.access_token as string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const eventType = body.event_type

    if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = body.resource
      const paypalOrderId = resource?.id || resource?.supplementary_data?.related_ids?.order_id
      const referenceId = resource?.purchase_units?.[0]?.reference_id

      let orderId = referenceId
      if (!orderId && paypalOrderId) {
        const order = await prisma.order.findFirst({
          where: { transactionId: paypalOrderId, paymentMethod: 'paypal' },
        })
        orderId = order?.id
      }

      if (orderId) {
        const setting = await prisma.paymentSetting.findUnique({ where: { method: 'paypal' } })
        const config = parseConfig(setting?.config)
        if (config.clientId && config.clientSecret && eventType === 'CHECKOUT.ORDER.APPROVED') {
          try {
            const token = await getPayPalToken(config.clientId, config.clientSecret)
            await fetch(`https://api-m.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            })
          } catch (e) {
            console.error('PayPal capture error:', e)
          }
        }

        await confirmOrderPayment({
          orderId,
          transactionId: paypalOrderId,
          source: 'paypal_webhook',
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 })
  }
}
