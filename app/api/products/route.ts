import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || ''

    // Explicitly select only fields that exist in your schema
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        AND: search ? [
          {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          },
        ] : {},
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        stock: true,
        category: true,
        images: true,
        bannerImage: true,
        isActive: true,
        isLimited: true,
        discount: true,
        startDate: true,
        endDate: true,
        variants: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    // Log the real error to your VPS terminal
    console.error('❌ Products API Crash:', error)

    // Return a clean error response so the frontend doesn't crash
    return NextResponse.json(
      { error: 'Failed to load products. Check VPS logs.' },
      { status: 500 }
    )
  }
}
