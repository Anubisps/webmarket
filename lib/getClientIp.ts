export function normalizeIp(ip: string): string {
  const trimmed = ip.trim()
  if (trimmed.startsWith('::ffff:')) return trimmed.slice(7)
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed.slice(1, -1)
  return trimmed
}

export function isPrivateOrLoopbackIp(ip: string): boolean {
  const n = normalizeIp(ip)
  if (!n || n === 'unknown' || n === 'client') return true
  if (n === 'localhost') return true
  if (n === '::1' || n === '127.0.0.1') return true
  if (/^10\./.test(n)) return true
  if (/^192\.168\./.test(n)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(n)) return true
  if (/^169\.254\./.test(n)) return true
  if (n.startsWith('fe80:') || n.startsWith('fc') || n.startsWith('fd')) return true
  return false
}

/** Resolve the visitor's public IP from trusted proxy headers. Returns null if only private/proxy IPs found. */
export function getClientIp(request: Request): string | null {
  const singleValueHeaders = [
    'cf-connecting-ip',
    'true-client-ip',
    'x-real-ip',
    'x-client-ip',
    'fastly-client-ip',
    'x-vercel-forwarded-for',
  ]

  for (const header of singleValueHeaders) {
    const value = request.headers.get(header)?.trim()
    if (!value) continue
    const ip = normalizeIp(value.split(',')[0])
    if (!isPrivateOrLoopbackIp(ip)) return ip
  }

  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const ips = forwarded.split(',').map(s => normalizeIp(s.trim())).filter(Boolean)
    for (const ip of ips) {
      if (!isPrivateOrLoopbackIp(ip)) return ip
    }
    for (let i = ips.length - 1; i >= 0; i--) {
      if (!isPrivateOrLoopbackIp(ips[i])) return ips[i]
    }
  }

  return null
}

/** Best-effort IP for analytics — always returns an IP string; never skips recording due to proxy setup. */
export function resolveAnalyticsIp(request: Request): { ip: string; isPublic: boolean } {
  const publicIp = getClientIp(request)
  if (publicIp) return { ip: publicIp, isPublic: true }

  const candidates = [
    request.headers.get('cf-connecting-ip'),
    request.headers.get('true-client-ip'),
    request.headers.get('x-real-ip'),
    request.headers.get('x-forwarded-for')?.split(',')[0],
    request.headers.get('x-client-ip'),
  ]

  for (const raw of candidates) {
    if (!raw?.trim()) continue
    const ip = normalizeIp(raw.split(',')[0].trim())
    if (ip && ip !== 'unknown') {
      return { ip, isPublic: !isPrivateOrLoopbackIp(ip) }
    }
  }

  return { ip: 'unknown', isPublic: false }
}

export function formatIpForDisplay(ip: string | null | undefined, isPublic?: boolean): string {
  if (!ip || ip === 'unknown' || ip === 'client') return 'Unknown'
  const n = normalizeIp(ip)
  if (isPublic === false || isPrivateOrLoopbackIp(n)) {
    return `${n} (proxy/local — check nginx X-Real-IP)`
  }
  return n
}
