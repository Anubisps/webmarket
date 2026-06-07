import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

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

    const body = await request.json()
    const { name, slug, description, price, stock, category, isActive, isLimited, discount, startDate, endDate } = body

    // Validate required fields
    if (!name || !slug || !price || !stock || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if slug is unique
    const existing = await prisma.product.findUnique({
      where: { slug }
    })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || '',
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        isActive: isActive !== undefined ? isActive : true,
        isLimited: isLimited || false,
        discount: discount ? parseFloat(discount) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
