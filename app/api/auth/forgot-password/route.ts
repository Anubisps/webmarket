import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000)

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expires }
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@windvault.store',
      to: email,
      subject: 'Reset your WindVault password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">WindVault Market</h2>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Reset Password</a>
          <p>If you didn't request this, you can ignore this email.</p>
          <p>This link expires in 1 hour.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">WindVault Market – Secure & Anonymous</p>
        </div>
      `
    })

    return NextResponse.json({ message: 'Reset link sent to your email' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
