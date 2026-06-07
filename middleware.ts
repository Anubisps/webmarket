import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip API routes and static assets
  if (request.nextUrl.pathname.startsWith('/api') || 
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/uploads')) {
    return NextResponse.next()
  }

  // Check if in maintenance mode by fetching settings
  try {
    const res = await fetch(`${request.nextUrl.origin}/api/settings`)
    const settings = await res.json()
    
    if (settings.maintenance_mode === true) {
      // Allow access to /maintenance page
      if (request.nextUrl.pathname === '/maintenance') {
        return NextResponse.next()
      }
      // Redirect to maintenance page
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
  } catch (error) {
    // If settings can't be loaded, proceed normally
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
