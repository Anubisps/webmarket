import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isLimited: true,
        endDate: { gt: new Date() },
      },
      include: { category: { select: { name: true } } },
      orderBy: { endDate: 'asc' },
      take: 6,
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error(error)
    return NextResponse.json([], { status: 500 })
  }
}
