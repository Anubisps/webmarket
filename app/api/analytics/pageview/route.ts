import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { resolveAnalyticsIp } from '@/lib/getClientIp'
import { lookupGeo } from '@/lib/geoip'

export async function POST(req: Request) {
  try {
    let userId: string | null = null
    let username: string | null = null
    let isLoggedIn = false
    let skipTracking = false

    const session = await getServerSession(authOptions)
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, username: true, role: true },
      })
      if (user) {
        if (['admin', 'manager'].includes(user.role)) {
          skipTracking = true
        } else {
          userId = user.id
          username = user.username
          isLoggedIn = true
        }
      }
    }

    if (!isLoggedIn) {
      const token = await getToken({
        req: req as Parameters<typeof getToken>[0]['req'],
        secret: process.env.NEXTAUTH_SECRET,
      })
      if (token?.id && token?.role && !['admin', 'manager'].includes(String(token.role))) {
        userId = String(token.id)
        username = String(token.username || token.name || '')
        isLoggedIn = true
      }
    }

    if (skipTracking) {
      return NextResponse.json({ success: true, skipped: 'admin' })
    }

    const body = await req.json()
    const { path, method, referer, query, sessionId } = body

    const { ip, isPublic } = resolveAnalyticsIp(req)
    const userAgent = body.userAgent || req.headers.get('user-agent') || ''
    const geo = isPublic ? await lookupGeo(ip) : {}

    await prisma.analyticsEvent.create({
      data: {
        sessionId: sessionId || 'anonymous',
        path: path || '/',
        method: method || 'GET',
        ip,
        userAgent,
        referer: referer || '',
        query: query || '',
        eventType: 'pageview',
        userId,
        username,
        isLoggedIn,
        extra: {
          ...(geo.country ? geo : {}),
          ipPublic: isPublic,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics pageview error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
