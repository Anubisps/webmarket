import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import CheckoutUI from './CheckoutUI'

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) redirect('/login')

  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product || product.stock < 1) {
    redirect('/products')
  }

  const paymentSettings = await prisma.paymentSetting.findMany({
    where: { enabled: true }
  })

  const methods = paymentSettings.map(s => ({
    id: s.method,
    label: s.label,
    instructions: s.instructions,
    walletAddress: s.walletAddress
  }))

  if (methods.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center py-20">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12 max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Payment Unavailable</h1>
          <p className="text-gray-400">No payment methods are currently enabled.</p>
          <a href={`/products/${product.slug}`} className="mt-4 inline-block text-purple-400 hover:text-purple-300 transition-colors">
            ← Back to product
          </a>
        </div>
      </div>
    )
  }

  return (
    <CheckoutUI
      productId={product.id}
      productName={product.name}
      price={product.price}
      methods={methods}
      userId={user.id}
    />
  )
}
