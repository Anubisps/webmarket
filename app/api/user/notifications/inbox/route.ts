import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({
    notifications: notifications.map(n => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
    unread: notifications.filter(n => !n.isRead).length,
  })
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { markAllRead, id } = await request.json().catch(() => ({}))

  if (markAllRead) {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    })
    return NextResponse.json({ success: true })
  }

  if (id) {
    await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { isRead: true },
    })
  }

  return NextResponse.json({ success: true })
}
