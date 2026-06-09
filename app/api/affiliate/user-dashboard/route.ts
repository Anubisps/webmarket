import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

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
                order: {
                  select: {
                    id: true,
                    total: true,
                    createdAt: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create affiliate if not exists
    if (!user.affiliate) {
      const code = 'REF' + Math.random().toString(36).substr(2, 8).toUpperCase()
      await prisma.affiliate.create({
        data: {
          userId: user.id,
          code
        }
      })
    }

    // Fetch referred users separately
    const referredUsers = await prisma.user.findMany({
      where: {
        referredBy: user.id
      },
      include: {
        orders: {
          select: {
            id: true,
            total: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const affiliate = user.affiliate!
    const totalEarnings = affiliate.referrals.reduce((sum, r) => sum + r.commission, 0)
    const totalReferrals = affiliate.referrals.length
    const totalReferredUsers = referredUsers.length
    const totalPurchased = referredUsers.filter(u => u.orders.length > 0).length
    const totalPending = totalReferredUsers - totalPurchased
    const referralLink = `https://windvault.store/register?ref=${affiliate.code}`

    return NextResponse.json({
      affiliate,
      referredUsers,
      totalEarnings,
      totalReferrals,
      totalReferredUsers,
      totalPurchased,
      totalPending,
      referralLink,
      balance: affiliate.balance // ✅ Include balance so user sees admin adjustments
    })
  } catch (error) {
    console.error('Error fetching affiliate data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
