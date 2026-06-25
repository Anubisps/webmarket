import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { requireCsrf } from '@/lib/security/requireCsrf'
import type { NextRequest } from 'next/server'

export async function POST(request: Request) {
  try {
    const req = request as unknown as NextRequest
    const csrfError = await requireCsrf(req)
    if (csrfError) return csrfError

    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { action, orderIds, productIds } = await request.json()

    if (action === 'mark_paid' && Array.isArray(orderIds)) {
      const { confirmOrderPayment } = await import('@/lib/payments/confirmPayment')
      for (const id of orderIds) {
        await confirmOrderPayment({ orderId: id, source: 'admin_bulk', actorEmail: user.email })
      }
      return NextResponse.json({ success: true, count: orderIds.length })
    }

    if (action === 'fulfill' && Array.isArray(orderIds)) {
      const { fulfillOrder } = await import('@/lib/payments/confirmPayment')
      for (const id of orderIds) {
        await fulfillOrder({ orderId: id, actorEmail: user.email, actorId: user.id })
      }
      return NextResponse.json({ success: true, count: orderIds.length })
    }

    if (action === 'activate_products' && Array.isArray(productIds)) {
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { isActive: true },
      })
      return NextResponse.json({ success: true, count: productIds.length })
    }

    if (action === 'deactivate_products' && Array.isArray(productIds)) {
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { isActive: false },
      })
      return NextResponse.json({ success: true, count: productIds.length })
    }

    return NextResponse.json({ error: 'Invalid bulk action' }, { status: 400 })
  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
