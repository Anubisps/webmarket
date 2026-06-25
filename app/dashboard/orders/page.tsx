import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import {
  ShoppingBag,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  Package,
  Box,
  CreditCard,
  Sparkles,
} from 'lucide-react'

function getOrderCardStyle(status: string, paymentStatus: string) {
  if (status === 'completed' && paymentStatus === 'paid') {
    return {
      border: 'border-emerald-400/40',
      glow: 'shadow-[0_20px_60px_rgba(16,185,129,0.18)]',
      gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      accent: 'text-emerald-300',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      label: 'Completed',
    }
  }
  if (status === 'cancelled') {
    return {
      border: 'border-red-400/30',
      glow: 'shadow-[0_20px_60px_rgba(239,68,68,0.12)]',
      gradient: 'from-red-500/15 via-red-500/5 to-transparent',
      accent: 'text-red-300',
      badge: 'bg-red-500/15 text-red-300 border-red-400/30',
      label: 'Cancelled',
    }
  }
  if (status === 'disputed') {
    return {
      border: 'border-orange-400/35',
      glow: 'shadow-[0_20px_60px_rgba(249,115,22,0.15)]',
      gradient: 'from-orange-500/15 via-orange-500/5 to-transparent',
      accent: 'text-orange-300',
      badge: 'bg-orange-500/15 text-orange-300 border-orange-400/30',
      label: 'Disputed',
    }
  }
  if (paymentStatus === 'pending') {
    return {
      border: 'border-amber-400/35',
      glow: 'shadow-[0_20px_60px_rgba(245,158,11,0.16)]',
      gradient: 'from-amber-500/15 via-yellow-500/5 to-transparent',
      accent: 'text-amber-300',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
      label: 'Pending Payment',
    }
  }
  return {
    border: 'border-blue-400/30',
    glow: 'shadow-[0_20px_60px_rgba(59,130,246,0.14)]',
    gradient: 'from-blue-500/15 via-purple-500/5 to-transparent',
    accent: 'text-blue-300',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
    label: 'In Progress',
  }
}

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
    processing: { icon: Clock, label: 'Processing' },
    completed: { icon: CheckCircle, label: 'Completed' },
    cancelled: { icon: XCircle, label: 'Cancelled' },
    disputed: { icon: AlertCircle, label: 'Disputed' },
  }

  const paymentStatusConfig = {
    pending: { icon: Clock, label: 'Pending Payment' },
    paid: { icon: CheckCircle, label: 'Paid' },
    failed: { icon: XCircle, label: 'Failed' },
    refunded: { icon: AlertCircle, label: 'Refunded' },
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-12">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-gray-300">Your Orders</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-2">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">My Orders</span>
          </h1>
          <p className="text-gray-400">Newest orders first — tap a card to view details and download your invoice.</p>
        </div>

        {user.orders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-16 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <Box className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No orders yet</h3>
            <p className="text-gray-400">Start shopping and your orders will appear here.</p>
            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 mt-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-all">
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {user.orders.map((order, index) => {
              const cardStyle = getOrderCardStyle(order.status, order.paymentStatus)
              const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
              const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || { label: order.status }
              const PaymentIcon = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.icon || Clock
              const paymentInfo = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig] || { label: order.paymentStatus }
              const productNames = order.items.map(item => item.product.name).join(', ')

              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className={`group relative overflow-hidden rounded-3xl border ${cardStyle.border} bg-white/[0.04] backdrop-blur-xl ${cardStyle.glow} hover:-translate-y-2 transition-all duration-300`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cardStyle.gradient} pointer-events-none`} />
                  <div className="relative p-6">
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">Order</p>
                        <h2 className="text-2xl font-bold">#{order.id.slice(0, 8)}</h2>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[11px] font-bold border ${cardStyle.badge}`}>
                        {cardStyle.label}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/30 text-xs text-gray-300">
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/30 text-xs text-gray-300">
                        <PaymentIcon className="w-3 h-3" />
                        {paymentInfo.label}
                      </span>
                    </div>

                    <div className="rounded-2xl bg-black/25 border border-white/10 p-4 mb-5">
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Package className="w-4 h-4" />
                        {order.items.length} item{order.items.length === 1 ? '' : 's'}
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">{productNames}</p>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <p className={`text-3xl font-extrabold ${cardStyle.accent}`}>
                          {order.total.toFixed(2)} <span className="text-sm font-semibold text-gray-400">USD</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                          View <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                          <CreditCard className="w-3 h-3" />
                          {order.paymentMethod || 'Manual'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Sparkles className={`w-8 h-8 ${cardStyle.accent}`} />
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
