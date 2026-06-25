import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sessions = await prisma.userSession.findMany({
    where: { userId: user.id },
    orderBy: { lastActive: 'desc' },
    take: 20,
  })

  return NextResponse.json(sessions)
}

export async function POST() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const token = randomBytes(32).toString('hex')
  const row = await prisma.userSession.create({
    data: { userId: user.id, token },
  })
  return NextResponse.json(row)
}

export async function DELETE(request: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, all } = await request.json().catch(() => ({}))
  if (all) {
    await prisma.userSession.deleteMany({ where: { userId: user.id } })
    return NextResponse.json({ success: true })
  }
  if (id) {
    await prisma.userSession.deleteMany({ where: { id, userId: user.id } })
  }
  return NextResponse.json({ success: true })
}
