import { prisma } from '@/lib/db'

let cache: Record<string, string> | null = null
let cacheAt = 0
const TTL = 30_000

export async function getSiteSetting(key: string, fallback = ''): Promise<string> {
  const now = Date.now()
  if (!cache || now - cacheAt > TTL) {
    const rows = await prisma.siteSetting.findMany({ select: { key: true, value: true } })
    cache = Object.fromEntries(rows.map(r => [r.key, r.value || '']))
    cacheAt = now
  }
  return cache[key] ?? fallback
}

export async function getSecuritySettings() {
  const [rateLimiting, maxLoginAttempts, sessionTimeoutMinutes, maintenanceMode, allowDiscountStacking] = await Promise.all([
    getSiteSetting('rate_limiting', 'true'),
    getSiteSetting('max_login_attempts', '5'),
    getSiteSetting('session_timeout', '10080'),
    getSiteSetting('maintenance_mode', 'false'),
    getSiteSetting('allow_discount_stacking', 'false'),
  ])
  return {
    rateLimiting: rateLimiting === 'true',
    maxLoginAttempts: parseInt(maxLoginAttempts, 10) || 5,
    sessionTimeoutMinutes: parseInt(sessionTimeoutMinutes, 10) || 10080,
    maintenanceMode: maintenanceMode === 'true',
    allowDiscountStacking: allowDiscountStacking === 'true',
  }
}

export function clearSiteSettingsCache() {
  cache = null
  cacheAt = 0
}
