import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    let userId: string | null = null
    let username: string | null = null
    let isLoggedIn = false
    let skipTracking = false

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

    if (skipTracking) {
      return NextResponse.json({ success: true, skipped: 'admin' })
    }

    const body = await req.json()
    const { path, method, ip, userAgent, referer, query, sessionId } = body

    const isLocal = ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1'
    if (isLocal) {
      return NextResponse.json({ success: true, skipped: 'localhost' })
    }

    await prisma.analyticsEvent.create({
      data: {
        sessionId: sessionId || 'anonymous',
        path: path || '/',
        method: method || 'GET',
        ip: ip || 'unknown',
        userAgent: userAgent || '',
        referer: referer || '',
        query: query || '',
        eventType: 'pageview',
        userId,
        username,
        isLoggedIn,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics pageview error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
