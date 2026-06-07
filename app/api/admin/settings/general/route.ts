import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

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

    const { settings } = await request.json()

    for (const s of settings) {
      let value = s.value
      // Convert boolean values to string for storage
      if (typeof value === 'boolean') {
        value = value ? 'true' : 'false'
      }
      await prisma.siteSetting.update({
        where: { id: s.id },
        data: { value: String(value) }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
