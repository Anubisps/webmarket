import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    // 1. Authentication
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

    // 2. Parse request body
    const body = await request.json()
    const {
      name, slug, description, price, stock, category,
      isActive, isLimited, discount, startDate, endDate
    } = body

    // 3. Validate required fields
    if (!name || !slug || !price || !stock || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 4. Check slug uniqueness
    const existing = await prisma.product.findUnique({
      where: { slug }
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // 5. 🔑 Find the category by name OR slug
    const categoryRecord = await prisma.category.findFirst({
      where: {
        OR: [
          { name: category },
          { slug: category }
        ]
      }
    })

    if (!categoryRecord) {
      return NextResponse.json(
        { error: `Category "${category}" not found. Please create it first.` },
        { status: 400 }
      )
    }

    // 6. Create product with proper category relation
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || '',
        price: parseFloat(price),
        stock: parseInt(stock),
        category: {
          connect: { id: categoryRecord.id }
        },
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
