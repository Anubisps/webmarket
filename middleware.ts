import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory cache for maintenance mode setting
let maintenanceCache: { value: boolean; expiry: number } | null = null
const CACHE_TTL = 30 * 1000 // 30 seconds

function getMaintenanceFromCache(): boolean | null {
  if (!maintenanceCache || Date.now() > maintenanceCache.expiry) {
    return null
  }
  return maintenanceCache.value
}

function setMaintenanceCache(value: boolean): void {
  maintenanceCache = {
    value,
    expiry: Date.now() + CACHE_TTL
  }
}

export async function middleware(request: NextRequest) {
  // Skip API routes and static assets
  if (request.nextUrl.pathname.startsWith('/api') || 
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/uploads')) {
    return NextResponse.next()
  }

  // Check cache first
  let maintenanceMode = getMaintenanceFromCache()

  // If cache miss, fetch (with timeout to prevent blocking)
  if (maintenanceMode === null) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout
      
      const res = await fetch(`${request.nextUrl.origin}/api/settings`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (res.ok) {
        const settings = await res.json()
        maintenanceMode = settings.maintenance_mode === true
        setMaintenanceCache(maintenanceMode)
      } else {
        maintenanceMode = false
      }
    } catch (error) {
      // On timeout or error, assume not in maintenance mode
      maintenanceMode = false
    }
  }

  if (maintenanceMode) {
    // Allow access to /maintenance page
    if (request.nextUrl.pathname === '/maintenance') {
      return NextResponse.next()
    }
    // Redirect to maintenance page
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
