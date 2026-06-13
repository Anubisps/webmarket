import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await req.json()
    const {
      name, slug, description, price, stock, categoryId,
      isActive, isLimited, discount, startDate, endDate,
      images, variants, bannerImage, availabilityMessage
    } = body

    // Build data object for Prisma
    const updateData: any = {
      name,
      slug,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId: categoryId || null,
      isActive,
      isLimited,
      discount: discount ? parseFloat(discount) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      images: images || [],
      variants: variants || null,
      bannerImage: bannerImage || null
    }

    // If you have an availabilityMessage column in your Product model, uncomment:
    // if (availabilityMessage !== undefined) {
    //   updateData.availabilityMessage = availabilityMessage
    // }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
