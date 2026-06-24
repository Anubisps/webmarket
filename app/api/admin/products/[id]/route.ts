import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function GET(
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
    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: { category: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('GET product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
      images, variants, bannerImage,
      availabilityMessage, showAvailabilityMessage,
      productNote, customDelivery, customNote,
      enableUsernameFetch, fetchProvider, gameIdLabel
    } = body

    const parsedEnableFetch = enableUsernameFetch === 'inherit' || enableUsernameFetch === null || enableUsernameFetch === undefined
      ? null
      : enableUsernameFetch === true || enableUsernameFetch === 'true'

    const product = await prisma.product.update({
      where: { id },
      data: {
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
        bannerImage: bannerImage || null,
        productNote: productNote || null,
        customDelivery: customDelivery || null,
        customNote: customNote || null,
        enableUsernameFetch: parsedEnableFetch,
        fetchProvider: parsedEnableFetch === true ? (fetchProvider || 'wherewindsmeet') : parsedEnableFetch === false ? null : fetchProvider || null,
        gameIdLabel: gameIdLabel || null,
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('PUT product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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
    const { searchParams } = new URL(req.url)
    const permanent = searchParams.get('permanent') === 'true'

    if (permanent) {
      await prisma.$transaction([
        prisma.orderItem.deleteMany({ where: { productId: id } }),
        prisma.wishlistItem.deleteMany({ where: { productId: id } }),
        prisma.review.deleteMany({ where: { productId: id } }),
        prisma.bundleItem.deleteMany({ where: { productId: id } }),
        prisma.product.delete({ where: { id } }),
      ])

      return NextResponse.json({ success: true, message: 'Product permanently deleted from database' })
    }

    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      }
    })

    return NextResponse.json({ success: true, message: 'Product archived (soft deleted)' })
  } catch (error) {
    console.error('DELETE product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
