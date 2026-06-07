import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AnalyticsUI } from './AnalyticsUI'

export default async function AnalyticsPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || !['admin', 'manager'].includes(user.role)) {
    redirect('/dashboard')
  }

  // Total stats
  const totalUsers = await prisma.user.count()
  const totalProducts = await prisma.product.count()
  const totalOrders = await prisma.order.count()
  const totalRevenue = await prisma.order.aggregate({
    where: { status: 'completed' },
    _sum: { total: true }
  })

  // Orders per day (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const ordersByDay = await prisma.order.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: { gte: sevenDaysAgo }
    },
    _count: true
  })

  // Format for chart
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const count = ordersByDay.find(o => 
      o.createdAt.toISOString().slice(0, 10) === dateStr
    )?._count || 0
    days.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      orders: count
    })
  }

  // Best selling products
  const bestSellers = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true }
  })

  const productIds = bestSellers.map(item => item.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  })

  const topProducts = bestSellers
    .map(item => {
      const product = products.find(p => p.id === item.productId)
      return {
        name: product?.name || 'Unknown',
        quantity: item._sum.quantity || 0
      }
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    include: {
      user: {
        select: { username: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  return (
    <AnalyticsUI
      data={{
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders,
        totalUsers,
        totalProducts,
        days,
        topProducts,
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          user: { username: order.user.username },
          total: order.total,
          status: order.status
        }))
      }}
    />
  )
}
