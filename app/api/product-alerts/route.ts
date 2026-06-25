import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { productId, alertType = 'restock' } = await request.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const product = await prisma.product.findUnique({ where: { id: productId, deletedAt: null } })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const alert = await prisma.productAlert.upsert({
    where: {
      userId_productId_alertType: { userId: user.id, productId, alertType },
    },
    create: { userId: user.id, productId, alertType, notified: product.stock > 0 },
    update: { notified: product.stock > 0 },
  })

  return NextResponse.json({ success: true, alert })
}

export async function DELETE(request: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { productId, alertType = 'restock' } = await request.json()
  await prisma.productAlert.deleteMany({
    where: { userId: user.id, productId, alertType },
  })

  return NextResponse.json({ success: true })
}
