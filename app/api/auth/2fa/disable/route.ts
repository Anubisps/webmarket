import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear 2FA secret and devices
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorSecret: null,
        isVerified: false,
        twoFactorDevices: {
          deleteMany: {}
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
