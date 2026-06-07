import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticator } from 'otplib'

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA not enabled' }, { status: 400 })
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret
    })

    if (isValid) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }
  } catch (error) {
    console.error('2FA login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
