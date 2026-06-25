import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { Resend } from 'resend'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

const resend = new Resend(process.env.RESEND_API_KEY)

function siteUrl() {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://windvault.store'
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user) {
      return NextResponse.json({ error: 'Log out before requesting a password reset' }, { status: 400 })
    }

    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    })

    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000)

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expires },
    })

    const resetUrl = `${siteUrl()}/reset-password/${token}`

    if (process.env.RESEND_API_KEY) {
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@windvault.store',
        to: user.email,
        subject: 'Reset your WindVault password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8b5cf6;">WindVault Market</h2>
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; background: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Reset Password</a>
            <p style="word-break: break-all; font-size: 12px; color: #666;">${resetUrl}</p>
            <p>If you didn't request this, you can ignore this email.</p>
            <p>This link expires in 1 hour.</p>
          </div>
        `,
      })

      if (error) {
        console.error('Forgot password email error:', error)
        return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 })
      }
    } else {
      console.warn('RESEND_API_KEY missing — reset URL:', resetUrl)
    }

    return NextResponse.json({ message: 'Reset link sent to your email' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
