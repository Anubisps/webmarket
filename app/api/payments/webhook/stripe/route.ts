import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseConfig } from '@/lib/payments/processor'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const event = JSON.parse(body)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const orderId = session.metadata?.orderId
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'paid',
            status: 'completed',
            transactionId: session.payment_intent || session.id,
          },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 })
  }
}
