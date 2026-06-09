import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    const { sessionId, visitorName, visitorEmail, message } = await request.json()

    const adminEmail = process.env.ADMIN_EMAIL

    if (!adminEmail) {
      return NextResponse.json({ error: 'Admin email not configured' }, { status: 500 })
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Live Chat <onboarding@resend.dev>',
      to: [adminEmail],
      subject: '🚨 Expedite Call Request from Live Chat',
      html: `
        <h2>Expedite Call Request</h2>
        <p><strong>Visitor:</strong> ${visitorName || 'Guest'}</p>
        <p><strong>Email:</strong> ${visitorEmail || 'Not provided'}</p>
        <p><strong>Session ID:</strong> ${sessionId}</p>
        <p><strong>Message:</strong> ${message || 'No additional message'}</p>
        <p><strong>Logged in user:</strong> ${session?.user?.email || 'Not logged in'}</p>
        <p><a href="http://88.214.26.201:3000/accessadmin/livechat/${sessionId}">Click here to open the chat</a></p>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Expedite call error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
