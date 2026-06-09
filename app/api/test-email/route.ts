import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL

    if (!adminEmail) {
      return NextResponse.json({ error: 'Admin email not configured' }, { status: 500 })
    }

    const { data, error } = await resend.emails.send({
      from: 'WindVault Market <orders@windvault.store>',
      to: [adminEmail],
      subject: 'Test Email',
      html: '<p>This is a test email from WindVault.</p>'
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
