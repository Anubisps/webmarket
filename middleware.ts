import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function middleware(request: NextRequest) {
  // Check if CSRF token cookie exists
  let csrfToken = request.cookies.get('csrf_token')?.value
  
  const response = NextResponse.next()

  // If token doesn't exist, generate and set it
  if (!csrfToken) {
    csrfToken = generateCSRFToken()
    response.cookies.set('csrf_token', csrfToken, {
      httpOnly: false, // ✅ Allow client-side JavaScript to read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    })
  }

  // ✅ Also set it as a header for server-side verification
  response.headers.set('x-csrf-token', csrfToken)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/csrf (CSRF endpoint)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
