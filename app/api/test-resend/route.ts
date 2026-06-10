import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'WindVault Market <verify@windvault.store>',
      to: ['your-email@example.com'], // Replace with your email
      subject: 'Test Email',
      html: '<p>If you receive this, Resend works!</p>'
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Email sent!' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
