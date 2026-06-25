import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { processAutoPayment } from '@/lib/payments/processor'
import { sendOrderConfirmation, sendManualPaymentInstructions } from '@/lib/email'
import { rateLimitResponse } from '@/lib/security/applyRateLimit'
import { requireCsrf } from '@/lib/security/requireCsrf'
import type { NextRequest } from 'next/server'
import { isProductPubliclyAvailable } from '@/lib/activeProduct'
import { calcReferralDiscount, canStackDiscounts } from '@/lib/discountStacking'
import { writeAuditLog } from '@/lib/auditLog'
import { sendDiscordNotification } from '@/lib/events/discord'
import { getUserLoyalty } from '@/lib/loyalty'

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

type ProductVariant = { id: string; name: string; price?: number; stock?: number }

function resolveVariantPrice(product: { price: number; variants: unknown }, variantId?: string) {
  if (!variantId || !product.variants) return { price: product.price, options: null as Record<string, string> | null }
  const variants = product.variants as ProductVariant[]
  if (!Array.isArray(variants)) return { price: product.price, options: null }
  const variant = variants.find(v => v.id === variantId)
  if (!variant) return { price: product.price, options: null }
  return {
    price: typeof variant.price === 'number' ? variant.price : product.price,
    options: { variantId: variant.id, variantName: variant.name },
  }
}

export async function POST(request: Request) {
  try {
    const req = request as unknown as NextRequest
    const limited = await rateLimitResponse(req, 5, 60 * 1000)
    if (limited) return limited

    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const csrfError = await requireCsrf(req)
    if (csrfError) return csrfError

    const {
      productId, providerId, userId, ign, ignUsername, contactEmail,
      discountCode, referralCode, variantId, subscriptionId,
      wantsSubscription, subscriptionCommitmentYears,
    } = await request.json()

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

    const { price: unitPrice, options } = resolveVariantPrice(product, variantId)
    const allowStack = await canStackDiscounts()
    let discountAmount = 0
    let hasCoupon = false

    if (discountCode) {
      const discount = await prisma.discount.findUnique({ where: { code: discountCode.toUpperCase() } })
      if (discount) {
        const isExpired = discount.expiresAt && new Date() > discount.expiresAt
        const hasReachedLimit = discount.usageLimit && discount.usageCount >= discount.usageLimit
        const applies = discountAppliesToProduct(discount, product)
        if (!isExpired && !hasReachedLimit && applies) {
          discountAmount = calcDiscountAmount(discount, unitPrice)
          hasCoupon = true
          await prisma.discount.update({
            where: { id: discount.id },
            data: { usageCount: { increment: 1 } },
          })
        }
      }
    }

    const referralDiscount = calcReferralDiscount(unitPrice, user.referralDiscountUsed, allowStack, hasCoupon)
    if (referralDiscount > 0) {
      await prisma.user.update({ where: { id: user.id }, data: { referralDiscountUsed: true } })
    }

    const loyalty = await getUserLoyalty(user.id)
    const loyaltyDiscount = loyalty.qualified
      ? unitPrice * (loyalty.discountPercent / 100)
      : 0

    const subscribe = !subscriptionId && !!wantsSubscription && product.subscriptionEnabled
    const commitmentYears = subscribe && subscriptionCommitmentYears
      ? Math.min(Math.max(parseInt(String(subscriptionCommitmentYears), 10) || 1, 1), 5)
      : null

    const total = Math.max(unitPrice - discountAmount - referralDiscount - loyaltyDiscount, 0)

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        ign: ign || null,
        ignUsername: ignUsername || null,
        contactEmail: contactEmail || null,
        total,
        discountAmount: discountAmount > 0 || referralDiscount > 0 || loyaltyDiscount > 0
          ? discountAmount + referralDiscount + loyaltyDiscount
          : null,
        status: 'processing',
        paymentStatus: 'pending',
        paymentMethod: providerId,
        bannerImage: product.bannerImage || null,
        fulfillmentStatus: 'pending',
        isSubscriptionRenewal: !!subscriptionId,
        subscriptionId: subscriptionId || null,
        wantsSubscription: subscribe,
        subscriptionCommitmentYears: commitmentYears,
      },
    })

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: 1,
        price: unitPrice,
        options: options || undefined,
      },
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

    if (subscriptionId) {
      const sub = await prisma.subscription.findFirst({ where: { id: subscriptionId, userId: user.id } })
      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            lastOrderId: order.id,
            nextDueDate: new Date(Date.now() + sub.intervalDays * 24 * 60 * 60 * 1000),
          },
        })
      }
    }

    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: true } } },
    })

    await sendOrderConfirmation(orderWithItems!, user)

    await writeAuditLog({
      userId: user.id,
      actorEmail: user.email,
      action: 'order.created',
      entity: 'order',
      entityId: order.id,
      details: { paymentMethod: providerId, total },
    })

    await sendDiscordNotification('order.created', {
      title: 'New order',
      description: `Order #${order.id.slice(0, 8)} created`,
      fields: [
        { name: 'Customer', value: user.username },
        { name: 'Total', value: `$${total.toFixed(2)} USD` },
        { name: 'Payment', value: paymentSetting.mode === 'auto' ? `Auto (${providerId})` : `Manual (${providerId})` },
      ],
    })

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

    if (paymentSetting.instructions) {
      await sendManualPaymentInstructions(orderWithItems!, user, paymentSetting.instructions)
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      manual: true,
      instructions: paymentSetting.instructions,
      walletAddress: paymentSetting.walletAddress,
      discountApplied: discountAmount > 0 || referralDiscount > 0,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
