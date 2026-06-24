import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { CheckCircle, Package, ArrowRight, Sparkles, Home } from 'lucide-react'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; test?: string; method?: string }>
}) {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const params = await searchParams
  const orderId = params.orderId
  if (!orderId) redirect('/dashboard/orders')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect('/login')

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { items: { include: { product: { select: { name: true } } } } },
  })

  if (!order) redirect('/dashboard/orders')

  const isTest = params.test === '1'

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-16">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[60%] w-[60%] rounded-full bg-emerald-600/15 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[60%] w-[60%] rounded-full bg-teal-600/15 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-2xl px-4 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/30">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
        </div>

        <h1 className="mb-2 text-4xl font-extrabold">
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Payment Successful
          </span>
        </h1>

        {isTest && (
          <p className="mb-4 inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-sm text-amber-300">
            <Sparkles className="h-4 w-4" />
            Test payment — no real charge
          </p>
        )}

        <p className="mb-8 text-lg text-gray-400">
          Thank you! Your order <strong className="text-white">#{order.id.slice(0, 8)}</strong> has been confirmed.
        </p>

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-lg">
          <div className="mb-4 flex items-center gap-2 font-bold">
            <Package className="h-5 w-5 text-emerald-400" />
            Order Summary
          </div>
          <div className="space-y-2 text-sm">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-gray-300">
                <span>{item.product.name}</span>
                <span>${item.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-white/10 pt-3 font-bold text-white">
              <span>Total paid</span>
              <span className="text-emerald-400">${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Payment method</span>
              <span className="capitalize">{order.paymentMethod || 'Manual'}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Status</span>
              <span className="capitalize text-emerald-400">{order.paymentStatus}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/dashboard/orders/${order.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-bold transition hover:scale-[1.02]"
          >
            View Order <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium transition hover:bg-white/10"
          >
            <Home className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
