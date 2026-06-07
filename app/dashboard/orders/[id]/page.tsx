import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle, MessageCircle, Calendar, User, Mail, CreditCard, Package, Shield } from 'lucide-react'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) redirect('/login')

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: user.id
    },
    include: {
      items: {
        include: {
          product: true
        }
      },
      disputes: true,
      ticket: true
    }
  })

  if (!order) {
    redirect('/dashboard/orders')
  }

  const hasTicket = order.ticket !== null

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

  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
  const PaymentIcon = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.icon || Clock

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/dashboard/orders" className="flex items-center text-purple-600 mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Order #{order.id.slice(0,8)}</h1>
              <p className="text-sm opacity-80 mt-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusConfig[order.status as keyof typeof statusConfig]?.bg || 'bg-gray-100'} ${statusConfig[order.status as keyof typeof statusConfig]?.color || 'text-gray-700'}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.bg || 'bg-gray-100'} ${paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.color || 'text-gray-700'}`}>
                <PaymentIcon className="w-3 h-3" />
                {paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.label || order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <User className="w-4 h-4" /> In-Game Name / ID
              </p>
              <p className="font-medium">{order.ign || 'Not provided'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Contact Email
              </p>
              <p className="font-medium">{order.contactEmail || 'Not provided'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Method
              </p>
              <p className="font-medium capitalize">{order.paymentMethod || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-xl font-bold text-purple-600">${order.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Items
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <span className="font-medium">{item.product.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">${item.price.toFixed(2)} × {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-6 flex flex-wrap gap-3">
            {!hasTicket ? (
              <Link
                href={`/dashboard/tickets/new?orderId=${order.id}`}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                <MessageCircle className="w-4 h-4" /> Create Ticket for This Order
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-green-600 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-4 h-4" /> Ticket Created
                <Link href={`/dashboard/tickets/${order.ticket?.id}`} className="text-sm underline ml-1">
                  View Ticket
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
