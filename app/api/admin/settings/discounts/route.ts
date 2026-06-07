import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(discounts)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { code, discount, expiresAt, usageLimit } = await request.json()

    const existing = await prisma.discount.findUnique({
      where: { code }
    })
    if (existing) {
      return NextResponse.json({ error: 'Code already exists' }, { status: 400 })
    }

    const discountRecord = await prisma.discount.create({
      data: {
        code,
        discount: parseFloat(discount),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null
      }
    })

    return NextResponse.json(discountRecord)
  } catch (error) {
    console.error('Discount creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
