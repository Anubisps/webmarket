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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { adjustment } = await request.json()

    const affiliate = await prisma.affiliate.update({
      where: { id },
      data: {
        balance: {
          increment: adjustment
        }
      }
    })

    return NextResponse.json(affiliate)
  } catch (error) {
    console.error('Error adjusting balance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
