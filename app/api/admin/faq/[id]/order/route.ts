import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const { order } = await req.json()

    await prisma.faq.update({
      where: { id },
      data: { order }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update FAQ order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
