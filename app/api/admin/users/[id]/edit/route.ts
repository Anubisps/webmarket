import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || !['admin', 'manager'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { username, email } = await request.json()

    // Check if username or email already taken (by another user)
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username, NOT: { id } },
          { email, NOT: { id } }
        ]
      }
    })

    if (existing) {
      if (existing.username === username) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      } else {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { username, email }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Edit user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
