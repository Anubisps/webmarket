import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle, MessageCircle, Calendar, User, Mail, CreditCard, Package, Shield, Box, ArrowRight } from 'lucide-react'

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

  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
  const PaymentIcon = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.icon || Clock

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white py-12">
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        
        {/* ===== BACKGROUND AMBIENCE ===== */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-emerald-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-teal-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* ===== BACK BUTTON ===== */}
        <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Orders</span>
        </Link>

        {/* ===== MAIN ORDER CARD ===== */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.4)]">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold">Order #{order.id.slice(0,8)}</h1>
                <p className="text-sm text-emerald-100 mt-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${statusConfig[order.status as keyof typeof statusConfig]?.bg || 'bg-white/10'} ${statusConfig[order.status as keyof typeof statusConfig]?.color || 'text-white'}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.bg || 'bg-white/10'} ${paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.color || 'text-white'}`}>
                  <PaymentIcon className="w-3 h-3" />
                  {paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.label || order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            
            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4" /> In-Game Name / ID
                </p>
                <p className="font-medium">{order.ign || 'Not provided'}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Contact Email
                </p>
                <p className="font-medium">{order.contactEmail || 'Not provided'}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Payment Method
                </p>
                <p className="font-medium capitalize">{order.paymentMethod || 'N/A'}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {order.total.toFixed(2)} USDC
                </p>
              </div>
            </div>

            {/* Items Section */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                Items
              </h2>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
                {order.items.map((item, index) => (
                  <div key={item.id} className={`flex justify-between items-center py-2 ${index !== order.items.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <span className="font-medium">{item.product.name}</span>
                    <span className="text-sm text-gray-400">{item.price.toFixed(2)} USDC × {item.quantity}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {order.total.toFixed(2)} USDC
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="pt-6 border-t border-white/5 flex flex-wrap gap-4">
              {!hasTicket ? (
                <Link
                  href={`/dashboard/tickets/new?orderId=${order.id}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-105 transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> Create Ticket for This Order
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle className="w-4 h-4" /> Ticket Created
                  <Link href={`/dashboard/tickets/${order.ticket?.id}`} className="text-sm underline ml-1 hover:text-emerald-300 transition-colors">
                    View Ticket
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
