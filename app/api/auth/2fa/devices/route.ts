import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        twoFactorDevices: {
          orderBy: { lastUsedAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const has2FA = user.twoFactorSecret !== null

    return NextResponse.json({
      enabled: has2FA,
      devices: user.twoFactorDevices
    })
  } catch (error) {
    console.error('2FA devices error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
