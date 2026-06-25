import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { publicProductWhere } from '@/lib/activeProduct'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const sort = searchParams.get('sort') || 'featured'
    const inStock = searchParams.get('inStock') === '1'

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Build where clause – ✅ fixed to handle empty categoryId
    const where: any = { ...publicProductWhere }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (categoryId && categoryId !== '') {
      where.categoryId = categoryId
    }
    if (inStock) {
      where.stock = { gt: 0 }
    }

    // Build orderBy
    let orderBy: any = { order: 'asc' }
    if (sort === 'price_low') orderBy = { price: 'asc' }
    if (sort === 'price_high') orderBy = { price: 'desc' }
    if (sort === 'featured' || sort === 'newest') orderBy = { order: 'asc' }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        wishlists: {
          where: { userId }
        },
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
