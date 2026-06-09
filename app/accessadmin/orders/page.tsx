import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ShoppingCart, Sparkles, Box, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle, Eye, Filter } from 'lucide-react'

export default async function AdminOrders() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || !['admin', 'manager', 'processor'].includes(user.role)) {
    redirect('/dashboard')
  }

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: { username: true, email: true }
      },
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-gray-300">Orders</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            All <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Orders</span>
          </h1>
          <p className="text-gray-400 text-lg">{orders.length} total order(s)</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Total</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Payment</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <Box className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">#{order.id.slice(0,8)}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.user.username}</p>
                      <p className="text-xs text-gray-400">{order.user.email}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">{order.total.toFixed(2)} USDC</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                        order.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/accessadmin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
                      >
                        <Eye className="w-3 h-3" /> Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
