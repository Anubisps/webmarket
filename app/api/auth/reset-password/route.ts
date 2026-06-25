import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user) {
      return NextResponse.json({ error: 'Log out before resetting your password' }, { status: 400 })
    }

    const { token, newPassword } = await req.json()
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
