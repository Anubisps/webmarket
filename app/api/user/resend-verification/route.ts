import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.isVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 })
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
        pendingEmail: null,
      },
    })

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: true, message: 'Code generated (email not configured)' })
    }

    const { error } = await resend.emails.send({
      from: 'WindVault Market <verify@windvault.store>',
      to: [user.email],
      subject: 'Verify your WindVault email',
      html: `
        <h1>Verify your email</h1>
        <p>Hi ${user.username}, use this code to verify your account (optional):</p>
        <h2 style="font-size: 32px; letter-spacing: 4px;">${token}</h2>
        <p>Expires in 15 minutes.</p>
      `,
    })

    if (error) {
      console.error('Email error:', error)
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
