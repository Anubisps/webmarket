import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

function isMaintenanceBypass(path: string) {
  return (
    path.startsWith('/accessadmin') ||
    path.startsWith('/api') ||
    path.startsWith('/api/auth') ||
    path.startsWith('/login') ||
    path === '/maintenance'
  )
}

async function isMaintenanceEnabled(request: NextRequest): Promise<boolean> {
  if (process.env.MAINTENANCE_MODE === 'true') return true
  try {
    const url = new URL('/api/settings/maintenance', request.url)
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return false
    const data = await res.json()
    return data.maintenance === true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Maintenance mode — never use Prisma here (Edge runtime)
  if (!isMaintenanceBypass(path)) {
    const maintenance = await isMaintenanceEnabled(request)
    if (maintenance) {
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
  }

  let csrfToken = request.cookies.get('csrf_token')?.value
  const response = NextResponse.next()

  if (!csrfToken) {
    csrfToken = generateCSRFToken()
    response.cookies.set('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
  }
  response.headers.set('x-csrf-token', csrfToken)

  let sessionId = request.cookies.get('sessionId')?.value
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    response.cookies.set('sessionId', sessionId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
