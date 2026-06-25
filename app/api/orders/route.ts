import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      total: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      items: { include: { product: { select: { name: true } } } },
    },
  })

  return NextResponse.json({
    orders: orders.map(o => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
    })),
  })
}
