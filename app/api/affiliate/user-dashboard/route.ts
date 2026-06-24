import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        affiliate: {
          include: {
            referrals: {
              include: {
                order: { select: { id: true, total: true, createdAt: true } },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let affiliate = user.affiliate
    if (!affiliate) {
      const code = 'REF' + Math.random().toString(36).substring(2, 10).toUpperCase()
      affiliate = await prisma.affiliate.create({
        data: { userId: user.id, code },
        include: {
          referrals: {
            include: {
              order: { select: { id: true, total: true, createdAt: true } },
            },
          },
        },
      })
    }

    const referredUsers = await prisma.user.findMany({
      where: { referredBy: user.id },
      include: { orders: { select: { id: true, total: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const totalEarnings = affiliate.referrals.reduce((sum, r) => sum + r.commission, 0)
    const totalReferrals = affiliate.referrals.length
    const totalReferredUsers = referredUsers.length
    const totalPurchased = referredUsers.filter(u => u.orders.length > 0).length
    const totalPending = totalReferredUsers - totalPurchased
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://windvault.store'
    const referralLink = `${base}/register?ref=${affiliate.code}`

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        code: affiliate.code,
        commission: affiliate.commission,
        balance: affiliate.balance,
      },
      referredUsers,
      totalEarnings,
      totalReferrals,
      totalReferredUsers,
      totalPurchased,
      totalPending,
      referralLink,
      balance: affiliate.balance,
    })
  } catch (error) {
    console.error('Error fetching affiliate data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
