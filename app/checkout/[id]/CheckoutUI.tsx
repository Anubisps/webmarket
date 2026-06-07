'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, CreditCard, User, Mail, ArrowRight } from 'lucide-react'

interface PaymentMethod {
  id: string
  label: string
  instructions: string | null
  walletAddress: string | null
}

interface CheckoutUIProps {
  productId: string
  productName: string
  price: number
  methods: PaymentMethod[]
  userId: string
}

export default function CheckoutUI({ productId, productName, price, methods, userId }: CheckoutUIProps) {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [ign, setIgn] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderCreated, setOrderCreated] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [selectedMethodDetails, setSelectedMethodDetails] = useState<PaymentMethod | null>(null)

  const handlePlaceOrder = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method')
      return
    }

    if (!ign.trim()) {
      setError('Please enter your In-Game Name / ID')
      return
    }

    if (!contactEmail.trim()) {
      setError('Please enter your contact email')
      return
    }

    const method = methods.find(m => m.id === selectedMethod)
    if (!method) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          providerId: selectedMethod,
          userId,
          ign: ign.trim(),
          contactEmail: contactEmail.trim()
        })
      })

      const data = await res.json()

      if (res.ok) {
        setOrderId(data.orderId)
        setOrderCreated(true)
        setSelectedMethodDetails(method)

        if (data.manual) {
          setShowInstructions(true)
        } else {
          window.location.href = data.checkoutUrl
        }
      } else {
        setError(data.error || 'Failed to create order')
      }
    } catch (err) {
      setError('Network error – please try again')
    } finally {
      setLoading(false)
    }
  }

  if (showInstructions && selectedMethodDetails) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-gradient-to-br from-green-500 to-emerald-700 text-white p-6 rounded-xl shadow-lg mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Order Created!</h2>
              <p className="text-sm opacity-90">Order #{orderId.slice(0,8)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">{selectedMethodDetails.label}</h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-4 whitespace-pre-wrap">
            {selectedMethodDetails.instructions || 'No instructions provided.'}
          </div>
          {selectedMethodDetails.walletAddress && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium">Wallet Address:</p>
              <code className="block bg-gray-100 p-2 rounded mt-1 break-all">{selectedMethodDetails.walletAddress}</code>
            </div>
          )}
          <p className="text-gray-600 text-sm mt-4">
            After sending the payment, please create a support ticket with the transaction ID.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => router.push('/dashboard/orders')}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              View My Orders
            </button>
            <a
              href="/dashboard/tickets/new"
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            >
              Create Ticket
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-purple-600" />
          Checkout
        </h1>

        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h2 className="text-xl font-bold text-purple-800 mb-1">{productName}</h2>
          <p className="text-2xl font-bold text-purple-700">${price.toFixed(2)}</p>
        </div>

        <div className="space-y-4">
          {/* IGN Field */}
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <User className="w-4 h-4" /> In-Game Name / ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Warrior#1234"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              value={ign}
              onChange={e => setIgn(e.target.value)}
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Contact Email
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Payment Method</label>
            <div className="space-y-2">
              {methods.map(method => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                    selectedMethod === method.id ? 'border-purple-600 bg-purple-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={() => setSelectedMethod(method.id)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span>{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={loading || !selectedMethod || !ign.trim() || !contactEmail.trim()}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                Place Order <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By placing an order, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}
