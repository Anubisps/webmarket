import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    const userRole = session?.user?.role
    if (!session?.user?.id || !userRole || !['admin', 'manager'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, username } = body

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data: { email?: string; username?: string } = {}

    if (email !== undefined) {
      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
      }
      const emailTaken = await prisma.user.findFirst({
        where: { email: email.trim().toLowerCase(), NOT: { id } },
      })
      if (emailTaken) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
      data.email = email.trim().toLowerCase()
    }

    if (username !== undefined) {
      const clean = username.trim()
      if (!clean || clean.length < 3 || clean.length > 32) {
        return NextResponse.json({ error: 'Username must be 3–32 characters' }, { status: 400 })
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(clean)) {
        return NextResponse.json({ error: 'Username can only contain letters, numbers, _ and -' }, { status: 400 })
      }
      const nameTaken = await prisma.user.findFirst({
        where: { username: clean, NOT: { id } },
      })
      if (nameTaken) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
      data.username = clean
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        banned: true,
        isVerified: true,
        createdAt: true,
        twoFactorSecret: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
