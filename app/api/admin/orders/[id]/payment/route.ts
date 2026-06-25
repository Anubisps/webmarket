import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { confirmOrderPayment } from '@/lib/payments/confirmPayment'
import { requireCsrf } from '@/lib/security/requireCsrf'
import type { NextRequest } from 'next/server'

export async function PUT(
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
    if (!user || !['admin', 'manager', 'processor'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { paymentStatus, transactionId, note } = await request.json()
    const validStatuses = ['pending', 'paid', 'failed', 'refunded']
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }

    if (paymentStatus === 'paid') {
      const result = await confirmOrderPayment({
        orderId: id,
        transactionId,
        source: 'admin_manual',
        actorEmail: user.email,
      })
      if (!result.ok) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      if (note?.trim()) {
        await prisma.order.update({
          where: { id },
          data: { staffNote: note.trim() },
        })
      }
      const order = await prisma.order.findUnique({
        where: { id },
        include: { user: { select: { username: true, email: true } }, items: { include: { product: true } } },
      })
      return NextResponse.json(order)
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus,
        staffNote: note?.trim() || undefined,
        transactionId: transactionId || undefined,
      },
      include: {
        user: { select: { username: true, email: true } },
        items: { include: { product: true } },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Payment status update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
