import { getSecuritySettings } from '@/lib/security/siteSettings'

export async function canStackDiscounts(): Promise<boolean> {
  const settings = await getSecuritySettings()
  return settings.allowDiscountStacking
}

export function calcReferralDiscount(price: number, alreadyUsed: boolean, allowStack: boolean, hasCoupon: boolean) {
  if (alreadyUsed) return 0
  if (hasCoupon && !allowStack) return 0
  return price * 0.3
}
