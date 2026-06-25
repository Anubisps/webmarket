import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle, MessageCircle, Calendar, User, Mail, CreditCard, Package, Download, RefreshCw } from 'lucide-react'
import { productImageUrl } from '@/lib/productImage'
import { OrderTimeline } from '@/components/orders/OrderTimeline'

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
      ticket: true,
      refunds: { orderBy: { createdAt: 'desc' } },
      subscription: true,
    }
  })

  if (!order) {
    redirect('/dashboard/orders')
  }

  const hasTicket = order.ticket !== null

  const statusConfig = {
    processing: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Processing' },
    completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' },
    cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Cancelled' },
    disputed: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Disputed' },
    refunded: { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Refunded' },
  }

  const paymentStatusConfig = {
    pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending Payment' },
    paid: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Paid' },
    failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
    refunded: { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Refunded' },
  }

  const fulfillmentConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Awaiting fulfillment', color: 'text-yellow-400' },
    processing: { label: 'Being processed', color: 'text-blue-400' },
    fulfilled: { label: 'Delivered / fulfilled', color: 'text-emerald-400' },
    cancelled: { label: 'Cancelled', color: 'text-red-400' },
  }

  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
  const PaymentIcon = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.icon || Clock
  const fulfillment = fulfillmentConfig[order.fulfillmentStatus] || fulfillmentConfig.pending

  const bannerSrc = productImageUrl(order.bannerImage)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-12">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="fixed inset-0 z-0">
          <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-pink-600/10 rounded-full blur-3xl"></div>
        </div>

        <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Orders</span>
        </Link>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.4)]">
          {bannerSrc && (
            <div className="relative w-full h-32 md:h-48 overflow-hidden">
              <img src={bannerSrc} alt="Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="md:col-span-2 p-6 border-b md:border-b-0 md:border-r border-white/10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold">Order #{order.id.slice(0,8)}</h1>
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[order.status as keyof typeof statusConfig]?.bg || 'bg-white/10'} ${statusConfig[order.status as keyof typeof statusConfig]?.color || 'text-gray-300'}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.bg || 'bg-white/10'} ${paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.color || 'text-gray-300'}`}>
                    <PaymentIcon className="w-3 h-3" />
                    {paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.label || order.paymentStatus}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/5 ${fulfillment.color}`}>
                    {fulfillment.label}
                  </span>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-4">
                <h2 className="text-sm font-bold text-gray-300 mb-4">Order timeline</h2>
                <OrderTimeline order={{
                  createdAt: order.createdAt,
                  paymentStatus: order.paymentStatus,
                  status: order.status,
                  fulfillmentStatus: order.fulfillmentStatus,
                  fulfilledAt: order.fulfilledAt,
                  refundTotal: order.refundTotal,
                }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> Game ID
                  </p>
                  <p className="text-sm font-medium font-mono">{order.ign || 'Not provided'}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> In-Game Username
                  </p>
                  <p className="text-sm font-medium">{order.ignUsername || 'Not fetched'}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="text-sm font-medium">{order.contactEmail || 'Not provided'}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Payment
                  </p>
                  <p className="text-sm font-medium capitalize">{order.paymentMethod || 'N/A'}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {order.total.toFixed(2)} USD
                  </p>
                  {order.discountAmount && (
                    <p className="text-xs text-green-400">-{order.discountAmount.toFixed(2)} USD discount</p>
                  )}
                </div>
                {order.wantsSubscription && (
                  <div className="bg-black/30 rounded-xl p-3 border border-cyan-500/20">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Subscription
                    </p>
                    <p className="text-sm font-medium text-cyan-300">
                      {order.subscriptionCommitmentYears
                        ? `${order.subscriptionCommitmentYears}-year commitment`
                        : 'Auto-renewal enabled'}
                    </p>
                  </div>
                )}
              </div>

              {order.paymentStatus === 'pending' && (
                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 mb-4">
                  <p className="text-sm text-amber-200 leading-relaxed">
                    If you used a manual payment method, please contact our staff through <strong>Live Chat</strong> or open a <strong>Support Ticket</strong> with your payment proof so we can confirm your order.
                  </p>
                </div>
              )}

              {(order.staffNote || order.fulfillmentStatus === 'fulfilled') && (
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20 mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-blue-400">Fulfillment notes</span>
                  </div>
                  {order.fulfilledAt && (
                    <p className="text-xs text-gray-500 mb-2">
                      Fulfilled {new Date(order.fulfilledAt).toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm text-gray-300">
                    {order.staffNote || 'Your order has been marked as fulfilled.'}
                  </p>
                </div>
              )}

              {order.refunds.length > 0 && (
                <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20">
                  <h3 className="text-sm font-bold text-indigo-300 mb-3">Refund history</h3>
                  <div className="space-y-2">
                    {order.refunds.map(refund => (
                      <div key={refund.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-white">${refund.amount.toFixed(2)} USD</p>
                          {refund.reason && <p className="text-xs text-gray-500">{refund.reason}</p>}
                          <p className="text-xs text-gray-600">{new Date(refund.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          refund.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {refund.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  {order.refundTotal > 0 && (
                    <p className="text-xs text-indigo-300 mt-3">
                      Total refunded: ${order.refundTotal.toFixed(2)} USD
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 flex flex-col">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Items
              </h2>
              <div className="flex-1 bg-black/30 rounded-xl p-3 border border-white/5 space-y-2 mb-4 overflow-auto max-h-[300px]">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                    <span className="text-sm">{item.product.name}</span>
                    <span className="text-xs text-gray-400">{item.price.toFixed(2)} × {item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                {!hasTicket ? (
                  <Link
                    href={`/dashboard/tickets/new?orderId=${order.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                  >
                    <MessageCircle className="w-4 h-4" /> Create Ticket
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/tickets/${order.ticket!.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition"
                  >
                    <CheckCircle className="w-4 h-4" /> View linked ticket
                  </Link>
                )}
                <Link
                  href={`/api/invoices/${order.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] transition"
                >
                  <Download className="w-4 h-4" /> Download Invoice
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
