import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getClientIp } from '@/lib/getClientIp'

export async function POST(request: Request) {
  try {
    const { visitorId, visitorName, visitorEmail } = await request.json()

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID required' }, { status: 400 })
    }

    const ipAddress = getClientIp(request)
    const name = visitorName?.trim() || 'Guest'
    const email = visitorEmail?.trim() || ''

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
          visitorName: name,
          visitorEmail: email,
          ipAddress,
          status: 'active'
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })
    } else {
      const updates: {
        visitorName?: string
        visitorEmail?: string
        ipAddress?: string | null
        status?: string
      } = {}

      if (name !== 'Guest' && name !== session.visitorName) {
        updates.visitorName = name
      }
      if (email && email !== session.visitorEmail) {
        updates.visitorEmail = email
      }
      if (ipAddress && ipAddress !== session.ipAddress) {
        updates.ipAddress = ipAddress
      }
      if (session.status === 'closed') {
        updates.status = 'active'
      }

      if (Object.keys(updates).length > 0) {
        session = await prisma.liveChatSession.update({
          where: { id: session.id },
          data: updates,
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        })
      }
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
