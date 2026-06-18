import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { sessionId, path, method, ip, userAgent, referer, query } = data

    await prisma.analyticsEvent.create({
      data: {
        sessionId,
        path,
        method,
        ip,
        userAgent,
        referer,
        query,
        eventType: 'pageview',
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}
