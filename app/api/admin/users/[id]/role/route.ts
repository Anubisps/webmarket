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

    const { role } = await request.json()
    const validRoles = ['user', 'admin', 'manager', 'support', 'processor']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Role change error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
