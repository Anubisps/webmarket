import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

function calcDiscountAmount(discount: { discount: number; discountType: string }, price: number) {
  if (discount.discountType === 'fixed') return Math.min(discount.discount, price)
  return price * (discount.discount / 100)
}

function discountAppliesToProduct(
  discount: { scopeType: string; scopeIds: unknown },
  product: { id: string; categoryId: string | null }
) {
  if (discount.scopeType === 'all') return true
  const ids = Array.isArray(discount.scopeIds) ? (discount.scopeIds as string[]) : []
  if (discount.scopeType === 'products') return ids.includes(product.id)
  if (discount.scopeType === 'categories') return product.categoryId ? ids.includes(product.categoryId) : false
  return false
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, productId } = await request.json()
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 400 })
    }

    const discount = await prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
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

    let product = null
    if (productId) {
      product = await prisma.product.findUnique({ where: { id: productId } })
      if (product && !discountAppliesToProduct(discount, product)) {
        return NextResponse.json({ error: 'This code does not apply to this product' }, { status: 400 })
      }
    }

    const price = product?.price || 0
    const amount = product ? calcDiscountAmount(discount, price) : discount.discount

    return NextResponse.json({
      valid: true,
      discount: amount,
      discountType: discount.discountType,
      rawDiscount: discount.discount,
      code: discount.code,
      scopeType: discount.scopeType,
    })
  } catch (error) {
    console.error('Discount verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
