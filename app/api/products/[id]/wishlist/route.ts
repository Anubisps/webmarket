import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: id
        }
      }
    })

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id }
      })
      return NextResponse.json({ success: true, wishlisted: false })
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId: session.user.id,
          productId: id
        }
      })
      return NextResponse.json({ success: true, wishlisted: true })
    }
  } catch (error) {
    console.error('Wishlist error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
