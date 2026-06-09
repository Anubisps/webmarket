import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const { visitorId, visitorName, visitorEmail } = await request.json()

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID required' }, { status: 400 })
    }

    // Capture IP address
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || null

    // Find or create session
    let session = await prisma.liveChatSession.findUnique({
      where: { visitorId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!session) {
      session = await prisma.liveChatSession.create({
        data: {
          visitorId,
          visitorName: visitorName || 'Guest',
          visitorEmail: visitorEmail || '',
          ipAddress: ipAddress, // 👈 Save IP
          status: 'active'
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
