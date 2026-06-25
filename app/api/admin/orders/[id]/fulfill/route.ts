import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { fulfillOrder } from '@/lib/payments/confirmPayment'
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

    const { note } = await request.json().catch(() => ({}))
    const order = await fulfillOrder({
      orderId: id,
      actorEmail: user.email,
      actorId: user.id,
      note,
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Fulfillment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
