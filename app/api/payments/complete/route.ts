import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseConfig } from '@/lib/payments/processor'
import { confirmOrderPayment } from '@/lib/payments/confirmPayment'

async function capturePayPalOrder(orderId: string, paypalOrderId: string) {
  const setting = await prisma.paymentSetting.findUnique({ where: { method: 'paypal' } })
  const config = parseConfig(setting?.config)
  if (!config.clientId || !config.clientSecret) return

  const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const tokenData = await tokenRes.json()
  if (!tokenRes.ok) return

  const captureRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
    },
  })
  const captureData = await captureRes.json()
  if (captureRes.ok && captureData.status === 'COMPLETED') {
    await confirmOrderPayment({
      orderId,
      transactionId: paypalOrderId,
      source: 'paypal_return',
    })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const sessionId = searchParams.get('session_id')
    const provider = searchParams.get('provider') || searchParams.get('method') || 'stripe'
    const token = searchParams.get('token') // PayPal order ID on return

    if (!orderId) {
      return NextResponse.redirect(new URL('/dashboard/orders', request.url))
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.redirect(new URL('/dashboard/orders', request.url))
    }

    if (order.paymentStatus === 'paid') {
      const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://windvault.store'
      return NextResponse.redirect(`${base}/checkout/success?orderId=${orderId}`)
    }

    if (provider === 'stripe' && sessionId) {
      const setting = await prisma.paymentSetting.findUnique({ where: { method: 'stripe' } })
      const config = parseConfig(setting?.config)
      if (config.secretKey) {
        const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${config.secretKey}` },
        })
        const session = await res.json()
        if (session.payment_status === 'paid') {
          await confirmOrderPayment({
            orderId,
            transactionId: session.payment_intent || sessionId,
            source: 'stripe_return',
          })
        }
      }
    }

    if (provider === 'paypal') {
      const paypalOrderId = token || order.transactionId
      if (paypalOrderId) {
        await capturePayPalOrder(orderId, paypalOrderId)
      }
    }

    if (provider === 'coinbase') {
      const setting = await prisma.paymentSetting.findUnique({ where: { method: 'coinbase' } })
      const config = parseConfig(setting?.config)
      const apiKey = config.apiKey || process.env.COINBASE_COMMERCE_API_KEY
      if (apiKey && order.transactionId) {
        const res = await fetch(`https://api.commerce.coinbase.com/charges/${order.transactionId}`, {
          headers: { 'X-CC-Api-Key': apiKey, 'X-CC-Version': '2018-03-22' },
        })
        const data = await res.json()
        const timeline = data?.data?.timeline || []
        const confirmed = timeline.some((t: { status: string }) => t.status === 'COMPLETED' || t.status === 'RESOLVED')
        if (confirmed) {
          await confirmOrderPayment({
            orderId,
            transactionId: order.transactionId,
            source: 'coinbase_return',
          })
        }
      }
    }

    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://windvault.store'
    return NextResponse.redirect(`${base}/checkout/success?orderId=${orderId}&method=${provider}`)
  } catch (error) {
    console.error('Payment complete error:', error)
    return NextResponse.redirect(new URL('/dashboard/orders', request.url))
  }
}
