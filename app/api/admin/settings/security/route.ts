import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const settings = await prisma.siteSetting.findMany({
      where: {
        category: 'security'
      }
    })

    const formatted = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value
      return acc
    }, {})

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Security settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { twoFactor, rateLimiting, sessionTimeout, maxLoginAttempts } = await request.json()

    await prisma.siteSetting.upsert({
      where: { key: 'enable_2fa' },
      update: { value: twoFactor ? 'true' : 'false' },
      create: { key: 'enable_2fa', value: twoFactor ? 'true' : 'false', label: 'Enable 2FA', category: 'security', type: 'boolean' }
    })
    await prisma.siteSetting.upsert({
      where: { key: 'rate_limiting' },
      update: { value: rateLimiting ? 'true' : 'false' },
      create: { key: 'rate_limiting', value: rateLimiting ? 'true' : 'false', label: 'Rate Limiting', category: 'security', type: 'boolean' }
    })
    await prisma.siteSetting.upsert({
      where: { key: 'session_timeout' },
      update: { value: String(sessionTimeout) },
      create: { key: 'session_timeout', value: String(sessionTimeout), label: 'Session Timeout', category: 'security', type: 'number' }
    })
    await prisma.siteSetting.upsert({
      where: { key: 'max_login_attempts' },
      update: { value: String(maxLoginAttempts) },
      create: { key: 'max_login_attempts', value: String(maxLoginAttempts), label: 'Max Login Attempts', category: 'security', type: 'number' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Security settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
