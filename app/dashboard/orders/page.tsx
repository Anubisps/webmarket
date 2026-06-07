import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ShoppingBag, Package, ArrowRight, CheckCircle, Clock, XCircle, AlertCircle, Calendar, DollarSign } from 'lucide-react'

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
    processing: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Processing' },
    completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
    cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
    disputed: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Disputed' },
  }

  const paymentStatusConfig = {
    pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending Payment' },
    paid: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Paid' },
    failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Failed' },
    refunded: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Refunded' },
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-purple-600" />
            My Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">View and manage your orders</p>
        </div>
      </div>

      {user.orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No orders yet.</p>
          <Link
            href="/products"
            className="inline-block px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {user.orders.map(order => {
            const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
            const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || { color: 'text-gray-600', bg: 'bg-gray-100', label: order.status }
            const PaymentIcon = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.icon || Clock
            const paymentInfo = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig] || { color: 'text-gray-600', bg: 'bg-gray-100', label: order.paymentStatus }
            return (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-[1.01] overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">Order #{order.id.slice(0,8)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${statusInfo.bg} ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${paymentInfo.bg} ${paymentInfo.color}`}>
                          <PaymentIcon className="w-3 h-3" />
                          {paymentInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {order.items.map(item => item.product.name).join(', ')}
                      </span>
                      <span className="flex items-center gap-1 text-purple-600 font-medium">
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
