import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function middleware(request: NextRequest) {
  // ── CSRF ──────────────────────────────────────────────
  let csrfToken = request.cookies.get('csrf_token')?.value
  const response = NextResponse.next()

  if (!csrfToken) {
    csrfToken = generateCSRFToken()
    response.cookies.set('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/'
    })
  }
  response.headers.set('x-csrf-token', csrfToken)

  // ── Analytics – skip admin pages ─────────────────────
  const path = request.nextUrl.pathname

  // ❌ Skip: static, API, admin pages, and analytics itself
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/static') ||
    path.startsWith('/accessadmin') ||
    path.includes('.')
  ) {
    return response
  }

  // Visitor tracking
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  const sessionId = request.cookies.get('sessionId')?.value || crypto.randomUUID()

  // Fire POST to analytics API (node.js)
  const analyticsUrl = new URL('/api/analytics/pageview', request.url)
  const data = {
    path,
    method: request.method,
    ip,
    userAgent,
    referer,
    query: request.nextUrl.search || '',
    sessionId,
  }

  // Non‑blocking fetch
  fetch(analyticsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {})

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/csrf).*)',
  ],
}
