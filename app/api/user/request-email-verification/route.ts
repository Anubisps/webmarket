import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newEmail } = await request.json()

    if (!newEmail || !newEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Check if email is already taken
    const existing = await prisma.user.findFirst({
      where: {
        email: newEmail,
        NOT: { id: session.user.id }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Generate verification token (6-digit code)
    const token = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save to database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pendingEmail: newEmail,
        emailVerificationToken: token,
        emailVerificationExpires: expires
      }
    })

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: 'WindVault Market <verify@windvault.store>',
      to: [newEmail],
      subject: 'Verify your email address',
      html: `
        <h1>Email Verification</h1>
        <p>Your verification code is:</p>
        <h2 style="font-size: 32px; letter-spacing: 4px;">${token}</h2>
        <p>This code expires in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    })

    if (error) {
      console.error('Email error:', error)
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Verification code sent' })
  } catch (error) {
    console.error('Verification request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
