import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'

export async function POST(req: Request) {
  const session = await getServerSession()
  const userId = session?.user?.id
  const { eventType, element, extra } = await req.json()

  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = req.headers.get('user-agent') || ''
  const referer = req.headers.get('referer') || ''

  await prisma.analyticsEvent.create({
    data: {
      sessionId: userId || 'anonymous',
      path: referer,
      method: 'POST',
      ip: typeof ip === 'string' ? ip : ip[0],
      userAgent,
      referer,
      eventType: eventType || 'click',
      element: element || '',
      extra: extra || null,
    }
  })

  return NextResponse.json({ success: true })
}
