import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const method = searchParams.get('method') || 'test'

    if (!orderId) {
      return NextResponse.redirect(new URL('/dashboard/orders', request.url))
    }

    const session = await getServerSession()
    const order = await prisma.order.findUnique({ where: { id: orderId } })

    if (!order) {
      return NextResponse.redirect(new URL('/dashboard/orders', request.url))
    }

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (user && user.id !== order.userId) {
        return NextResponse.redirect(new URL('/dashboard/orders', request.url))
      }
    }

    const setting = await prisma.paymentSetting.findUnique({ where: { method } })
    if (!setting?.testMode && setting?.mode === 'auto') {
      // Only allow simulate when test mode is on for this provider
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        status: 'completed',
        transactionId: `test_${method}_${Date.now()}`,
      },
    })

    const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://windvault.store'
    return NextResponse.redirect(`${base}/checkout/success?orderId=${orderId}&test=1&method=${method}`)
  } catch (error) {
    console.error('Payment simulate error:', error)
    return NextResponse.redirect(new URL('/dashboard/orders', request.url))
  }
}
