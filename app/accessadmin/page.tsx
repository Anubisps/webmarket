import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Clock, Box, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react'

export default async function AdminDashboard() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || !['admin', 'manager'].includes(user.role)) {
    redirect('/dashboard')
  }

  const totalUsers = await prisma.user.count()
  const totalProducts = await prisma.product.count()
  const totalOrders = await prisma.order.count()
  const totalRevenue = await prisma.order.aggregate({
    where: { status: 'completed' },
    _sum: { total: true }
  })

  const recentOrders = await prisma.order.findMany({
    include: {
      user: {
        select: { username: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Products', value: totalProducts, icon: Package, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'from-emerald-500 to-teal-500' },
    { label: 'Revenue', value: `$${totalRevenue._sum.total?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'from-yellow-500 to-orange-500' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white py-12">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        {/* ===== BACKGROUND AMBIENCE ===== */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-pink-600/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-gray-300">Admin Panel</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
              Admin <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-lg">Manage your marketplace with powerful tools.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 md:mt-0">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleString()}
          </div>
        </div>

        {/* ===== STATS GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <div className={`p-2 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ===== QUICK STATS ROW ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Recent Orders
            </h2>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-gray-400 text-sm">No recent orders</p>
              ) : (
                recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="font-medium text-sm">#{order.id.slice(0,8)}</p>
                      <p className="text-xs text-gray-400">{order.user.username}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-emerald-400">${order.total.toFixed(2)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/accessadmin/products/new" className="group p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-white/5 hover:border-purple-500/30 hover:scale-105 transition-all text-center">
                <p className="font-medium text-purple-400">Add Product</p>
                <p className="text-xs text-gray-400">Create a new product</p>
              </Link>
              <Link href="/accessadmin/orders" className="group p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-white/5 hover:border-emerald-500/30 hover:scale-105 transition-all text-center">
                <p className="font-medium text-emerald-400">Manage Orders</p>
                <p className="text-xs text-gray-400">View and update orders</p>
              </Link>
              <Link href="/accessadmin/users" className="group p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-white/5 hover:border-blue-500/30 hover:scale-105 transition-all text-center">
                <p className="font-medium text-blue-400">Manage Users</p>
                <p className="text-xs text-gray-400">View and edit users</p>
              </Link>
              <Link href="/accessadmin/settings/general" className="group p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-white/5 hover:border-yellow-500/30 hover:scale-105 transition-all text-center">
                <p className="font-medium text-yellow-400">Settings</p>
                <p className="text-xs text-gray-400">Configure your store</p>
              </Link>
            </div>
          </div>
        </div>

        {/* ===== FOOTER NOTE ===== */}
        <div className="text-center text-gray-500 text-sm border-t border-white/5 pt-6">
          <p>© 2026 WindVault Market. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
