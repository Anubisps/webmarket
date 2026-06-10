import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Verification token required' }, { status: 400 })
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    // Update email - using null directly
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail as string,
        pendingEmail: null,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        isVerified: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
