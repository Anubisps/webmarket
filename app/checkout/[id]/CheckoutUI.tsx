'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, CreditCard, User, Mail, ArrowRight, Sparkles, Lock, Shield, Zap } from 'lucide-react'

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
      <div className="min-h-screen bg-[#0a0a0f] text-white py-20">
        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          {/* Floating background glow */}
          <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 relative z-10">
            <div className="bg-gradient-to-r from-green-500 to-emerald-700 text-white p-6 rounded-2xl shadow-lg mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Order Created!</h2>
                  <p className="text-sm opacity-90">Order #{orderId.slice(0,8)}</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">{selectedMethodDetails.label}</h2>
            <div className="bg-black/30 rounded-xl p-4 mb-4 whitespace-pre-wrap border border-white/10">
              {selectedMethodDetails.instructions || 'No instructions provided.'}
            </div>
            {selectedMethodDetails.walletAddress && (
              <div className="bg-black/30 rounded-xl p-4 mb-4 border border-white/10">
                <p className="font-medium text-purple-400">Wallet Address:</p>
                <code className="block bg-black/50 p-3 rounded mt-1 break-all text-sm text-gray-300">
                  {selectedMethodDetails.walletAddress}
                </code>
              </div>
            )}
            <p className="text-gray-400 text-sm mt-4">
              After sending the payment, please create a support ticket with the transaction ID.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => router.push('/dashboard/orders')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all"
              >
                View My Orders
              </button>
              <Link
                href="/dashboard/tickets/new"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all"
              >
                Create Ticket
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-20">
      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        {/* Floating background glow */}
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold mb-1">{productName}</h2>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {price.toFixed(2)} USDC
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <User className="w-4 h-4" /> In-Game Name / ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Warrior#1234"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={ign}
                onChange={e => setIgn(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Contact Email
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Payment Method</label>
              <div className="space-y-2">
                {methods.map(method => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={() => setSelectedMethod(method.id)}
                      className="w-4 h-4 text-purple-600 accent-purple-500"
                    />
                    <span className="font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedMethod || !ign.trim() || !contactEmail.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  Place Order <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
