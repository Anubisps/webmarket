import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { paymentProviders } from '@/lib/payments'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { productId, providerId, userId, ign, contactEmail } = await request.json()

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product || product.stock < 1) {
      return NextResponse.json({ error: 'Product unavailable' }, { status: 400 })
    }

    // Create the order with IGN and Email
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        ign: ign || null,
        contactEmail: contactEmail || null,
        total: product.price,
        status: 'processing',
        paymentStatus: 'pending',
        paymentMethod: providerId
      }
    })

    // Create order item
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: 1,
        price: product.price
      }
    })

    // Decrement stock
    await prisma.product.update({
      where: { id: product.id },
      data: { stock: { decrement: 1 } }
    })

    // If manual payment method (not Coinbase), return order ID only
    if (providerId !== 'coinbase') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        manual: true
      })
    }

    // Coinbase Commerce auto-checkout
    const provider = paymentProviders[providerId]
    if (!provider || !provider.enabled) {
      return NextResponse.json({ error: 'Payment method unavailable' }, { status: 400 })
    }

    const payment = await provider.createPayment(order.id, product.price, 'USD', {})

    return NextResponse.json({
      success: true,
      checkoutUrl: payment.checkoutUrl,
      orderId: order.id,
      manual: false
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
