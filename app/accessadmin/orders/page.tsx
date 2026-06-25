import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ShoppingCart } from 'lucide-react'
import { AdminOrdersBoard } from './AdminOrdersBoard'

export default async function AdminOrders() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || !['admin', 'manager', 'processor'].includes(user.role)) redirect('/dashboard')

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { username: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const pendingPay = orders.filter(o => o.paymentStatus === 'pending').length

  return (
    <div className="min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] h-[65%] w-[65%] rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute bottom-[-25%] right-[-15%] h-[65%] w-[65%] rounded-full bg-teal-600/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
            <ShoppingCart className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-medium text-gray-300">Order Center</span>
          </div>
          <h1 className="text-3xl font-extrabold md:text-4xl">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Orders
            </span>
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            {orders.length} total · {pendingPay} awaiting payment
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Total', value: orders.length },
            { label: 'Processing', value: orders.filter(o => o.status === 'processing').length },
            { label: 'Completed', value: orders.filter(o => o.status === 'completed').length },
            { label: 'Pending pay', value: pendingPay },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-emerald-300">{s.value}</p>
            </div>
          ))}
        </div>

        <AdminOrdersBoard
          orders={orders.map(o => ({
            id: o.id,
            total: o.total,
            status: o.status,
            paymentStatus: o.paymentStatus,
            paymentMethod: o.paymentMethod,
            ign: o.ign,
            ignUsername: o.ignUsername,
            createdAt: o.createdAt.toISOString(),
            user: o.user,
          }))}
        />
      </div>
    </div>
  )
}
