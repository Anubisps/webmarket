import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { requireCsrf } from '@/lib/security/requireCsrf'
import type { NextRequest } from 'next/server'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const subs = await prisma.subscription.findMany({
    where: { userId: user.id },
    include: { product: { select: { id: true, name: true, slug: true, price: true } } },
    orderBy: { nextDueDate: 'asc' },
  })
  return NextResponse.json(subs)
}

export async function POST(request: Request) {
  try {
    const req = request as unknown as NextRequest
    const csrfError = await requireCsrf(req)
    if (csrfError) return csrfError

    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { productId, intervalDays, ign, contactEmail, paymentMethod } = await request.json()
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const days = Math.max(parseInt(String(intervalDays), 10) || 30, 1)
    const sub = await prisma.subscription.create({
      data: {
        userId: user.id,
        productId,
        intervalDays: days,
        price: product.price,
        nextDueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        paymentMethod: paymentMethod || 'manual',
        ign: ign || null,
        contactEmail: contactEmail || null,
      },
      include: { product: { select: { name: true } } },
    })

    return NextResponse.json(sub)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const req = request as unknown as NextRequest
    const csrfError = await requireCsrf(req)
    if (csrfError) return csrfError

    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id, status, intervalDays } = await request.json()
    const sub = await prisma.subscription.findFirst({ where: { id, userId: user.id } })
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: status || sub.status,
        intervalDays: intervalDays ? Math.max(parseInt(String(intervalDays), 10), 1) : sub.intervalDays,
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
