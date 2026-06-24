export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim()).filter(Boolean)
    const clientIp = ips.find((ip) => ip !== '127.0.0.1' && ip !== '::1')
    return clientIp || ips[0] || null
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp && realIp !== '127.0.0.1' && realIp !== '::1') {
    return realIp
  }

  const cfIp = request.headers.get('cf-connecting-ip')?.trim()
  if (cfIp) return cfIp

  return null
}
