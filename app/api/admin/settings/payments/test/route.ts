import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { processAutoPayment } from '@/lib/payments/processor'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { methodId } = await request.json()
    const setting = await prisma.paymentSetting.findUnique({ where: { id: methodId } })
    if (!setting) return NextResponse.json({ error: 'Method not found' }, { status: 404 })

    const product = await prisma.product.findFirst({ where: { deletedAt: null } })
    if (!product) {
      return NextResponse.json({ error: 'No products available for test order' }, { status: 400 })
    }

    const testOrder = await prisma.order.create({
      data: {
        userId: user.id,
        total: 1.0,
        status: 'processing',
        paymentStatus: 'pending',
        paymentMethod: setting.method,
      },
    })

    await prisma.orderItem.create({
      data: {
        orderId: testOrder.id,
        productId: product.id,
        quantity: 1,
        price: 1.0,
      },
    })

    const prevTestMode = setting.testMode
    if (!prevTestMode) {
      await prisma.paymentSetting.update({ where: { id: setting.id }, data: { testMode: true } })
    }

    const testSetting = { ...setting, testMode: true, mode: 'auto' as const }
    const payment = await processAutoPayment(testSetting, {
      orderId: testOrder.id,
      amount: 1.0,
      currency: 'USD',
      userEmail: user.email,
    })

    if (!prevTestMode) {
      await prisma.paymentSetting.update({ where: { id: setting.id }, data: { testMode: false } })
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: payment.checkoutUrl,
      orderId: testOrder.id,
      message: 'Test checkout created — opens simulated payment flow ($1.00, no real charge)',
    })
  } catch (error: any) {
    console.error('Payment test error:', error)
    return NextResponse.json({ error: error.message || 'Test failed' }, { status: 400 })
  }
}
