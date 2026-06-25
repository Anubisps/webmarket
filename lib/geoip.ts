import { isPrivateOrLoopbackIp, normalizeIp } from '@/lib/getClientIp'

export async function lookupGeo(ip: string): Promise<{ country?: string; city?: string; region?: string }> {
  const normalized = normalizeIp(ip)
  if (!normalized || isPrivateOrLoopbackIp(normalized)) {
    return {}
  }
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(normalized)}?fields=status,country,countryCode,regionName,city`,
      { signal: AbortSignal.timeout(2500) }
    )
    const data = await res.json()
    if (data.status !== 'success') return {}
    return { country: data.country, city: data.city, region: data.regionName }
  } catch {
    return {}
  }
}

export function parseBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes('edg/')) return 'Edge'
  if (ua.includes('chrome/')) return 'Chrome'
  if (ua.includes('firefox/')) return 'Firefox'
  if (ua.includes('safari/') && !ua.includes('chrome')) return 'Safari'
  return 'Other'
}
