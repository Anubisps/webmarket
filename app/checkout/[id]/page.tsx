import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import CheckoutUI from './CheckoutUI'

interface PaymentMethod {
  id: string
  label: string
  instructions: string | null
  walletAddress: string | null
}

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

  let methods: PaymentMethod[] = []
  try {
    const paymentSettings = await prisma.paymentSetting.findMany({
      where: { enabled: true }
    })
    methods = paymentSettings.map(s => ({
      id: s.method,
      label: s.label,
      instructions: s.instructions,
      walletAddress: s.walletAddress
    }))
  } catch (error) {
    console.error('Failed to load payment settings:', error)
    // Fallback to an empty array
    methods = []
  }

  if (methods.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Payment Unavailable</h1>
        <p className="text-gray-600">No payment methods are currently enabled.</p>
        <a href={`/products/${product.slug}`} className="mt-4 inline-block text-purple-600 hover:underline">← Back to product</a>
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
