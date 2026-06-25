import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/security/rateLimit'
import { getSecuritySettings } from '@/lib/security/siteSettings'

export async function applyRateLimit(req: NextRequest, limit = 10, windowMs = 60_000) {
  const settings = await getSecuritySettings()
  if (!settings.rateLimiting) return null
  return rateLimit(limit, windowMs)(req)
}

export async function rateLimitResponse(req: NextRequest, limit = 10, windowMs = 60_000) {
  const result = await applyRateLimit(req, limit, windowMs)
  return result
}
