import { prisma } from '@/lib/db'

const DEFAULT_THRESHOLD = 200
const DEFAULT_DISCOUNT = 5

export async function getLoyaltySettings() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: ['loyalty_spend_threshold', 'loyalty_discount_percent'] } },
  })
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]))
  return {
    threshold: parseFloat(map.loyalty_spend_threshold || '') || DEFAULT_THRESHOLD,
    discountPercent: parseFloat(map.loyalty_discount_percent || '') || DEFAULT_DISCOUNT,
  }
}

export async function getUserLifetimePaidSpend(userId: string): Promise<number> {
  const agg = await prisma.order.aggregate({
    where: {
      userId,
      paymentStatus: 'paid',
      status: { not: 'cancelled' },
    },
    _sum: { total: true },
  })
  return agg._sum.total || 0
}

export function getLoyaltyBenefit(spent: number, threshold: number, discountPercent: number) {
  const qualified = spent >= threshold
  return {
    spent,
    threshold,
    discountPercent,
    qualified,
    remaining: qualified ? 0 : Math.max(threshold - spent, 0),
  }
}

export async function getUserLoyalty(userId: string) {
  const settings = await getLoyaltySettings()
  const spent = await getUserLifetimePaidSpend(userId)
  return getLoyaltyBenefit(spent, settings.threshold, settings.discountPercent)
}
