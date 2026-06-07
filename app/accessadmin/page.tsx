import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

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
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Products', value: totalProducts, icon: Package, color: 'bg-purple-500' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'bg-green-500' },
    { label: 'Revenue', value: `$${totalRevenue._sum.total?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'bg-yellow-500' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-card p-6 rounded-xl shadow-lg hover:shadow-xl transition animate-fade-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Recent Orders
          </h2>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent orders</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-sm">#{order.id.slice(0,8)}</p>
                    <p className="text-xs text-gray-500">{order.user.username}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">${order.total.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/accessadmin/products/new"
              className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center"
            >
              <p className="font-medium text-purple-700">Add Product</p>
              <p className="text-xs text-gray-500">Create a new product</p>
            </Link>
            <Link
              href="/accessadmin/orders"
              className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center"
            >
              <p className="font-medium text-blue-700">Manage Orders</p>
              <p className="text-xs text-gray-500">View and update orders</p>
            </Link>
            <Link
              href="/accessadmin/users"
              className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-center"
            >
              <p className="font-medium text-green-700">Manage Users</p>
              <p className="text-xs text-gray-500">View and edit users</p>
            </Link>
            <Link
              href="/accessadmin/settings/general"
              className="block p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-center"
            >
              <p className="font-medium text-yellow-700">Settings</p>
              <p className="text-xs text-gray-500">Configure your store</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
