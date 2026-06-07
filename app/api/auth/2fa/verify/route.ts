import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authenticator } from 'otplib'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { token, secret, deviceName, userAgent, platform } = await request.json()

    const isValid = authenticator.verify({
      token,
      secret
    })

    if (isValid) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorSecret: secret,
          isVerified: true
        }
      })

      // Track the device
      await prisma.twoFactorDevice.create({
        data: {
          userId: user.id,
          deviceName: deviceName || 'Unknown Device',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || null,
          userAgent: userAgent || null
        }
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }
  } catch (error) {
    console.error('2FA verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
