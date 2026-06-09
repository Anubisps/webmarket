import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await request.json()
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 400 })
    }

    const discount = await prisma.discount.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!discount) {
      return NextResponse.json({ error: 'Discount code not found' }, { status: 404 })
    }

    if (discount.expiresAt && new Date() > discount.expiresAt) {
      return NextResponse.json({ error: 'Discount code has expired' }, { status: 400 })
    }

    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return NextResponse.json({ error: 'Discount code has reached its usage limit' }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      discount: discount.discount,
      code: discount.code
    })
  } catch (error) {
    console.error('Discount verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
