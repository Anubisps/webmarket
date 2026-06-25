import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { processOrderRefund } from '@/lib/payments/refunds'
import { requireCsrf } from '@/lib/security/requireCsrf'
import type { NextRequest } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const req = request as unknown as NextRequest
    const csrfError = await requireCsrf(req)
    if (csrfError) return csrfError

    const { id } = await params
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { amount, reason } = await request.json()
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const refundAmount = typeof amount === 'number' ? amount : order.total - (order.refundTotal || 0)
    const result = await processOrderRefund({
      orderId: id,
      amount: refundAmount,
      reason,
      actorEmail: user.email,
      actorId: user.id,
      partial: refundAmount < order.total,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Refund failed' }, { status: 400 })
  }
}
