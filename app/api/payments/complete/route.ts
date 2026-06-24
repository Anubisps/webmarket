import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseConfig } from '@/lib/payments/processor'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const sessionId = searchParams.get('session_id')
    const provider = searchParams.get('provider') || searchParams.get('method') || 'stripe'

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
      const secretKey = config.secretKey
      if (secretKey) {
        const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${secretKey}` },
        })
        const session = await res.json()
        if (session.payment_status === 'paid') {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'paid',
              status: 'completed',
              transactionId: session.payment_intent || sessionId,
            },
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
