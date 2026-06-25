import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { billingDaysFromType } from '@/lib/subscriptionFromProduct'

export async function GET() {
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

    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/admin/products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
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

    const body = await req.json()
    console.log('📦 Received product data:', JSON.stringify(body, null, 2))

    const {
      name, slug, description = '', price, stock, categoryId,
      isActive = true, isLimited = false, discount = null,
      startDate = null, endDate = null, images = [],
      variants = '[]', bannerImage = null,
      availabilityMessage = null, productNote, customDelivery,
      enableUsernameFetch, fetchProvider, gameIdLabel,
      subscriptionEnabled = false, subscriptionBillingType = 'monthly',
      subscriptionIntervalDays,
    } = body

    if (!name || !slug || price === undefined || stock === undefined) {
      console.error('❌ Missing required fields:', { name, slug, price, stock })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let parsedVariants = null
    if (variants) {
      try {
        parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants
      } catch (e) {
        console.error('⚠️ Failed to parse variants:', e)
        parsedVariants = null
      }
    }

    const intervalDays = subscriptionEnabled
      ? billingDaysFromType(subscriptionBillingType, subscriptionIntervalDays)
      : 30

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: categoryId || null,
        isActive,
        isLimited,
        discount: discount ? parseFloat(discount) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        images: images,
        variants: parsedVariants,
        bannerImage: bannerImage,
        availabilityMessage: availabilityMessage || null,
        productNote: productNote?.trim() || null,
        customNote: productNote?.trim() || null,
        customDelivery: customDelivery?.trim() || null,
        estimatedDelivery: customDelivery?.trim() || null,
        enableUsernameFetch: enableUsernameFetch === 'true' ? true : enableUsernameFetch === 'false' ? false : null,
        fetchProvider: fetchProvider || null,
        gameIdLabel: gameIdLabel?.trim() || null,
        subscriptionEnabled: !!subscriptionEnabled,
        subscriptionBillingType: subscriptionEnabled ? (subscriptionBillingType || 'monthly') : 'monthly',
        subscriptionIntervalDays: subscriptionEnabled ? intervalDays : 30,
        order: 0
      }
    })

    console.log('✅ Product created:', product.id)
    return NextResponse.json(product)
  } catch (error) {
    console.error('🔥 Product creation error:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
