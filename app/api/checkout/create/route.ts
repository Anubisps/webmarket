import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { processAutoPayment } from '@/lib/payments/processor'
import { sendOrderConfirmation } from '@/lib/email'
import { rateLimit } from '@/lib/security/rateLimit'
import { verifyCSRFToken } from '@/lib/security/csrf'
import type { NextRequest } from 'next/server'
import { isProductPubliclyAvailable } from '@/lib/activeProduct'

function calcDiscountAmount(
  discount: { discount: number; discountType: string },
  price: number
) {
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
    const req = request as unknown as NextRequest
    const rateLimitResult = await rateLimit(5, 60 * 1000)(req)
    if (rateLimitResult) return rateLimitResult

    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const csrfToken = req.headers.get('x-csrf-token')
    if (!csrfToken || !(await verifyCSRFToken(req))) {
      return NextResponse.json({ error: 'CSRF token invalid' }, { status: 403 })
    }

    const { productId, providerId, userId, ign, ignUsername, contactEmail, discountCode, referralCode } =
      await request.json()

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product || !isProductPubliclyAvailable(product) || product.stock < 1) {
      return NextResponse.json({ error: 'Product unavailable' }, { status: 400 })
    }

    const paymentSetting = await prisma.paymentSetting.findUnique({ where: { method: providerId } })
    if (!paymentSetting?.enabled) {
      return NextResponse.json({ error: 'Payment method unavailable' }, { status: 400 })
    }

    let discountAmount = 0

    if (discountCode) {
      const discount = await prisma.discount.findUnique({ where: { code: discountCode.toUpperCase() } })
      if (discount) {
        const isExpired = discount.expiresAt && new Date() > discount.expiresAt
        const hasReachedLimit = discount.usageLimit && discount.usageCount >= discount.usageLimit
        const applies = discountAppliesToProduct(discount, product)
        if (!isExpired && !hasReachedLimit && applies) {
          discountAmount = calcDiscountAmount(discount, product.price)
          await prisma.discount.update({
            where: { id: discount.id },
            data: { usageCount: { increment: 1 } },
          })
        }
      }
    }

    let referralDiscount = 0
    if (user.referredBy && !user.referralDiscountUsed) {
      referralDiscount = product.price * 0.3
      await prisma.user.update({ where: { id: user.id }, data: { referralDiscountUsed: true } })
    }

    const total = Math.max(product.price - discountAmount - referralDiscount, 0)

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        ign: ign || null,
        ignUsername: ignUsername || null,
        contactEmail: contactEmail || null,
        total,
        discountAmount: discountAmount > 0 ? discountAmount : null,
        status: 'processing',
        paymentStatus: 'pending',
        paymentMethod: providerId,
        bannerImage: product.bannerImage || null,
      },
    })

    await prisma.orderItem.create({
      data: { orderId: order.id, productId: product.id, quantity: 1, price: product.price },
    })

    await prisma.product.update({ where: { id: product.id }, data: { stock: { decrement: 1 } } })

    if (referralCode) {
      const affiliate = await prisma.affiliate.findUnique({ where: { code: referralCode.toUpperCase() } })
      if (affiliate && affiliate.userId !== user.id) {
        const commission = total * (affiliate.commission / 100)
        await prisma.affiliateReferral.create({
          data: { affiliateId: affiliate.id, orderId: order.id, commission },
        })
        await prisma.affiliate.update({
          where: { id: affiliate.id },
          data: { balance: { increment: commission } },
        })
      }
    }

    await sendOrderConfirmation(order, user)

    if (paymentSetting.mode === 'auto') {
      try {
        const payment = await processAutoPayment(paymentSetting, {
          orderId: order.id,
          amount: order.total,
          currency: 'USD',
          userEmail: user.email,
        })
        await prisma.order.update({
          where: { id: order.id },
          data: { transactionId: payment.paymentId },
        })
        return NextResponse.json({
          success: true,
          checkoutUrl: payment.checkoutUrl,
          orderId: order.id,
          manual: false,
          testMode: paymentSetting.testMode,
          discountApplied: discountAmount > 0 || referralDiscount > 0,
        })
      } catch (err: any) {
        console.error('Auto payment error:', err)
        return NextResponse.json({ error: err.message || 'Payment provider error' }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      manual: true,
      discountApplied: discountAmount > 0 || referralDiscount > 0,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
