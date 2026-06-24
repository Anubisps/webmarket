import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { isProductPubliclyAvailable } from '@/lib/activeProduct'
import { paymentProviders } from '@/lib/payments'
import { sendOrderConfirmation } from '@/lib/email'
import { rateLimit } from '@/lib/security/rateLimit'
import { verifyCSRFToken } from '@/lib/security/csrf'
import type { NextRequest } from 'next/server'

export async function POST(request: Request) {
  try {
    const req = request as unknown as NextRequest
    const rateLimitResult = await rateLimit(5, 60 * 1000)(req)
    if (rateLimitResult) return rateLimitResult

    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // ✅ CSRF Verification
    const csrfToken = req.headers.get('x-csrf-token')
    if (!csrfToken || !(await verifyCSRFToken(req))) {
    return NextResponse.json({ error: 'CSRF token invalid' }, { status: 403 })
    }

    const { productId, providerId, userId, ign, ignUsername, contactEmail, discountCode, referralCode } = await request.json()

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product || !isProductPubliclyAvailable(product) || product.stock < 1) {
      return NextResponse.json({ error: 'Product unavailable' }, { status: 400 })
    }

    let discountAmount = 0
    let appliedDiscountCode = null

    if (discountCode) {
      const discount = await prisma.discount.findUnique({
        where: { code: discountCode.toUpperCase() }
      })
      if (discount) {
        const isExpired = discount.expiresAt && new Date() > discount.expiresAt
        const hasReachedLimit = discount.usageLimit && discount.usageCount >= discount.usageLimit
        if (!isExpired && !hasReachedLimit) {
          discountAmount = discount.discount
          appliedDiscountCode = discount.code
          await prisma.discount.update({
            where: { id: discount.id },
            data: { usageCount: { increment: 1 } }
          })
        }
      }
    }

    // Check for referral discount (30% off for referred users on their first order)
    let referralDiscount = 0
    if (user.referredBy && !user.referralDiscountUsed) {
      referralDiscount = product.price * 0.30 // 30% off
      await prisma.user.update({
        where: { id: user.id },
        data: { referralDiscountUsed: true }
      })
    }

    const total = Math.max(product.price - discountAmount - referralDiscount, 0)

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        ign: ign || null,
        ignUsername: ignUsername || null,
        contactEmail: contactEmail || null,
        total: total,
        discountAmount: discountAmount > 0 ? discountAmount : null,
        status: 'processing',
        paymentStatus: 'pending',
        paymentMethod: providerId,
        bannerImage: product.bannerImage || null
      }
    })

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: 1,
        price: product.price
      }
    })

    await prisma.product.update({
      where: { id: product.id },
      data: { stock: { decrement: 1 } }
    })

    // Process referral commission
    if (referralCode) {
      const affiliate = await prisma.affiliate.findUnique({
        where: { code: referralCode.toUpperCase() }
      })
      if (affiliate && affiliate.userId !== user.id) {
        const commission = total * (affiliate.commission / 100)
        await prisma.affiliateReferral.create({
          data: {
            affiliateId: affiliate.id,
            orderId: order.id,
            commission
          }
        })
        await prisma.affiliate.update({
          where: { id: affiliate.id },
          data: { balance: { increment: commission } }
        })
      }
    }

    // Send email notification
    await sendOrderConfirmation(order, user)

    if (providerId !== 'coinbase') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        manual: true,
        discountApplied: discountAmount > 0 || referralDiscount > 0
      })
    }

    const provider = paymentProviders[providerId]
    if (!provider || !provider.enabled) {
      return NextResponse.json({ error: 'Payment method unavailable' }, { status: 400 })
    }

    const payment = await provider.createPayment(order.id, order.total, 'USD', {})

    return NextResponse.json({
      success: true,
      checkoutUrl: payment.checkoutUrl,
      orderId: order.id,
      manual: false,
      discountApplied: discountAmount > 0 || referralDiscount > 0
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
