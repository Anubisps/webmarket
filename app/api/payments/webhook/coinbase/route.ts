import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseConfig } from '@/lib/payments/processor'
import { confirmOrderPayment } from '@/lib/payments/confirmPayment'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const event = body.event || body
    const type = event?.type || event?.event?.type

    if (type === 'charge:confirmed' || type === 'charge:resolved') {
      const charge = event.data || event
      const orderId = charge?.metadata?.orderId || charge?.metadata?.order_id
      if (orderId) {
        await confirmOrderPayment({
          orderId,
          transactionId: charge.id || charge.code,
          source: 'coinbase_webhook',
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Coinbase webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 })
  }
}

export async function GET(request: Request) {
  // Coinbase sometimes sends GET for health checks
  return NextResponse.json({ ok: true })
}
