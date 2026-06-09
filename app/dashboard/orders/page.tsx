import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ShoppingBag, Package, ArrowRight, CheckCircle, Clock, XCircle, AlertCircle, Calendar, DollarSign, Box } from 'lucide-react'

export default async function OrdersPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: {
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!user) redirect('/login')

  const statusConfig = {
    processing: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Processing' },
    completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' },
    cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Cancelled' },
    disputed: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Disputed' },
  }

  const paymentStatusConfig = {
    pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending Payment' },
    paid: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Paid' },
    failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
    refunded: { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Refunded' },
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-12">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="fixed inset-0 z-0">
          <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-emerald-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-teal-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-gray-400">Track and manage your purchases.</p>
          </div>
        </div>

        {user.orders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-16 text-center">
            <Box className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No orders yet</h3>
            <p className="text-gray-400">Start shopping and your orders will appear here.</p>
            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 mt-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-all">
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {user.orders.map(order => {
              const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
              const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || { color: 'text-gray-400', bg: 'bg-white/5', label: order.status }
              const PaymentIcon = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.icon || Clock
              const paymentInfo = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig] || { color: 'text-gray-400', bg: 'bg-white/5', label: order.paymentStatus }
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="block bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold">Order #{order.id.slice(0,8)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.bg} ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${paymentInfo.bg} ${paymentInfo.color}`}>
                          <PaymentIcon className="w-3 h-3" />
                          {paymentInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {order.total.toFixed(2)} USDC
                      </p>
                      <p className="text-xs text-gray-400">{order.items.length} item(s)</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {order.items.map(item => item.product.name).join(', ')}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
