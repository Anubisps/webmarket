import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'

export async function POST(req: Request) {
  try {
    // 1. Skip if the user is an admin/manager
    const session = await getServerSession()
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      if (user && ['admin', 'manager'].includes(user.role)) {
        return NextResponse.json({ success: true, skipped: 'admin' })
      }
    }

    // 2. Parse and log
    const body = await req.json()
    const { path, method, ip, userAgent, referer, query, sessionId } = body

    // Skip localhost
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
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics pageview error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
