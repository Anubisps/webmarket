import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

function isSessionActive(lastTimestamp: Date): boolean {
  return lastTimestamp > new Date(Date.now() - 5 * 60 * 1000)
}

function formatDuration(start: Date, end: Date): string {
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
}

function parseDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile'
  if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet'
  return 'Desktop'
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!admin || !['admin', 'manager'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      revenueAgg,
      recentEvents,
      events7d,
      newUsers7d,
      orders7d,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.aggregate({ where: { status: 'completed' }, _sum: { total: true } }),
      prisma.analyticsEvent.findMany({
        orderBy: { timestamp: 'desc' },
        take: 5000,
        where: { timestamp: { gte: thirtyDaysAgo } },
      }),
      prisma.analyticsEvent.findMany({
        where: { timestamp: { gte: sevenDaysAgo }, eventType: 'pageview' },
        select: { timestamp: true, path: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, total: true, status: true },
      }),
    ])

    // Pageviews & revenue by day (7 days)
    const days: { date: string; pageviews: number; orders: number; revenue: number; signups: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      days.push({
        date: dateStr,
        pageviews: events7d.filter(e => e.timestamp >= d && e.timestamp < next).length,
        orders: orders7d.filter(o => o.createdAt >= d && o.createdAt < next).length,
        revenue: orders7d
          .filter(o => o.createdAt >= d && o.createdAt < next && o.status === 'completed')
          .reduce((s, o) => s + o.total, 0),
        signups: newUsers7d.filter(u => u.createdAt >= d && u.createdAt < next).length,
      })
    }

    // Top pages
    const pageCounts = new Map<string, number>()
    events7d.forEach(e => {
      const p = e.path.split('?')[0]
      pageCounts.set(p, (pageCounts.get(p) || 0) + 1)
    })
    const topPages = [...pageCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }))

    // Sessions
    const sessionsMap = new Map<string, typeof recentEvents>()
    recentEvents.forEach(event => {
      const key = event.sessionId || 'anonymous'
      if (!sessionsMap.has(key)) sessionsMap.set(key, [])
      sessionsMap.get(key)!.push(event)
    })

    const sessions = Array.from(sessionsMap.entries()).map(([sessionId, events]) => {
      const sorted = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      const active = isSessionActive(last.timestamp)
      const loggedInEvent = sorted.find(e => e.isLoggedIn)
      return {
        sessionId,
        ip: first.ip || 'unknown',
        userAgent: first.userAgent || '',
        device: parseDevice(first.userAgent || ''),
        firstVisit: first.timestamp.toISOString(),
        lastVisit: last.timestamp.toISOString(),
        active,
        duration: active ? 'Online now' : formatDuration(first.timestamp, last.timestamp),
        pages: [...new Set(sorted.map(e => e.path))],
        pageCount: sorted.length,
        isLoggedIn: !!loggedInEvent,
        username: loggedInEvent?.username || null,
        userId: loggedInEvent?.userId || null,
        currentPage: last.path,
      }
    })

    const activeSessions = sessions.filter(s => s.active).sort(
      (a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
    )
    const onlineLoggedIn = activeSessions.filter(s => s.isLoggedIn)
    const onlineGuests = activeSessions.filter(s => !s.isLoggedIn)

    // Device breakdown (active)
    const deviceBreakdown = { Desktop: 0, Mobile: 0, Tablet: 0 }
    activeSessions.forEach(s => {
      deviceBreakdown[s.device as keyof typeof deviceBreakdown]++
    })

    const bestSellers = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    })
    const productIds = bestSellers.map(i => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    })
    const topProducts = bestSellers.map(item => ({
      name: products.find(p => p.id === item.productId)?.name || 'Unknown',
      quantity: item._sum.quantity || 0,
    }))

    const recentOrders = await prisma.order.findMany({
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    })

    const pageviewsToday = recentEvents.filter(e => {
      const t = e.timestamp
      return t >= new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }).length

    return NextResponse.json({
      overview: {
        totalRevenue: revenueAgg._sum.total || 0,
        totalOrders,
        totalUsers,
        totalProducts,
        totalSessions: sessions.length,
        activeNow: activeSessions.length,
        onlineLoggedIn: onlineLoggedIn.length,
        onlineGuests: onlineGuests.length,
        pageviewsToday,
        pageviews7d: events7d.length,
      },
      charts: { days, deviceBreakdown, topPages, topProducts },
      live: {
        activeSessions: activeSessions.slice(0, 50),
        onlineLoggedIn: onlineLoggedIn.slice(0, 30),
        onlineGuests: onlineGuests.slice(0, 30),
      },
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        total: o.total,
        status: o.status,
        username: o.user.username,
        createdAt: o.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Analytics dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
