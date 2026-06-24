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

    const { name, slug, enableUsernameFetch, fetchProvider, gameIdLabel } = await request.json()
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        enableUsernameFetch: !!enableUsernameFetch,
        fetchProvider: enableUsernameFetch ? (fetchProvider || 'wherewindsmeet') : null,
        gameIdLabel: gameIdLabel || null,
      }
    })
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    await prisma.category.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
