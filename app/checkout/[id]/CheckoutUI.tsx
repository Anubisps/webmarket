'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, CreditCard, User, Mail, ArrowRight, Loader2, Tag, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

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
  fetchEnabled: boolean
  fetchProvider: string
  gameIdLabel: string
}

export default function CheckoutUI({
  productId,
  productName,
  price,
  methods,
  userId,
  fetchEnabled,
  fetchProvider,
  gameIdLabel,
}: CheckoutUIProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [ign, setIgn] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState<{ amount: number; code: string } | null>(null)
  const [isVerifyingDiscount, setIsVerifyingDiscount] = useState(false)
  const [discountError, setDiscountError] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderCreated, setOrderCreated] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [selectedMethodDetails, setSelectedMethodDetails] = useState<PaymentMethod | null>(null)
  const [fetchedUsername, setFetchedUsername] = useState<string | null>(null)
  const [csrfToken, setCsrfToken] = useState<string>('')
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // ✅ Wait for the component to mount on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ Fetch CSRF token from cookie (only after mounted)
  useEffect(() => {
    if (!mounted) return
    const cookies = document.cookie.split(';')
    const csrfCookie = cookies.find(c => c.trim().startsWith('csrf_token='))
    if (csrfCookie) {
      setCsrfToken(csrfCookie.split('=')[1])
    } else {
      console.warn('⚠️ Connection Unavailable')
    }
  }, [mounted])

  const finalPrice = Math.max(price - (discountApplied?.amount || 0), 0)

  // ✅ Button disabled check (only after mounted)
  const isButtonDisabled = !mounted || loading || !selectedMethod || !ign.trim() || !contactEmail.trim() || !csrfToken

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code')
      return
    }
    setIsVerifyingDiscount(true)
    setDiscountError('')
    try {
      const res = await fetch('/api/checkout/verify-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim() })
      })
      const data = await res.json()
      if (res.ok && data.valid) {
        setDiscountApplied({ amount: data.discount, code: discountCode.trim() })
        toast.success(`✅ Discount applied: ${data.discount} USDC off!`)
      } else {
        setDiscountApplied(null)
        setDiscountError(data.error || 'Invalid discount code')
      }
    } catch (err) {
      setDiscountError('Failed to verify discount')
    } finally {
      setIsVerifyingDiscount(false)
    }
  }

  const handleRemoveDiscount = () => {
    setDiscountApplied(null)
    setDiscountCode('')
    setDiscountError('')
    toast('Discount removed')
  }

  useEffect(() => {
    if (!mounted || !fetchEnabled || !ign.trim() || !/^\d+$/.test(ign)) {
      setIsFetching(false)
      if (!fetchEnabled) setFetchedUsername(null)
      return
    }

    setIsFetching(true)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/checkout/fetch-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: ign, provider: fetchProvider })
        })
        const data = await res.json()
        if (res.ok) {
          setFetchedUsername(data.username)
          setFetchError('')
        } else {
          setFetchError(data.error || 'Failed to fetch username')
          setFetchedUsername(null)
        }
      } catch (err) {
        setFetchError('Network error')
        setFetchedUsername(null)
      } finally {
        setIsFetching(false)
      }
    }, 800)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [ign, mounted, fetchEnabled, fetchProvider])

  const handlePlaceOrder = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method')
      return
    }
    if (!ign.trim()) {
      setError('Please enter your In-Game ID')
      return
    }
    if (!contactEmail.trim()) {
      setError('Please enter your contact email')
      return
    }
    if (!csrfToken) {
      setError('CSRF missing please contact support.')
      return
    }
    const method = methods.find(m => m.id === selectedMethod)
    if (!method) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({
          productId,
          providerId: selectedMethod,
          userId,
          ign: ign.trim(),
          ignUsername: fetchEnabled ? fetchedUsername : null,
          contactEmail: contactEmail.trim(),
          discountCode: discountApplied?.code || null,
          referralCode: null
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
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-700 text-white p-6 rounded-2xl shadow-lg mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Order Created!</h2>
                  <p className="text-sm opacity-90">Order #{orderId.slice(0,8)}</p>
                </div>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300 mb-1">Used a manual payment method?</p>
                <p className="text-sm text-amber-100/90 leading-relaxed">
                  Please contact our staff through <strong>Live Chat</strong> or open a <strong>Support Ticket</strong> with your payment proof so we can confirm and process your order as quickly as possible.
                </p>
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
            {discountApplied && (
              <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/30 mb-4">
                <p className="text-sm text-green-400">✅ Referral discount applied: {discountApplied.amount} USDC</p>
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
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold mb-1">{productName}</h2>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {finalPrice.toFixed(2)} USDC
              </p>
              {discountApplied && (
                <p className="text-sm text-green-400">-{discountApplied.amount} USDC</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <User className="w-4 h-4" /> {gameIdLabel}{fetchEnabled ? ' (numbers only)' : ''}
              </label>
              <input
                type="text"
                required
                pattern={fetchEnabled ? '[0-9]*' : undefined}
                inputMode={fetchEnabled ? 'numeric' : 'text'}
                placeholder={fetchEnabled ? 'e.g., 123456789' : 'Enter your player ID or IGN'}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={ign}
                onChange={(e) => {
                  const value = fetchEnabled ? e.target.value.replace(/\D/g, '') : e.target.value
                  setIgn(value)
                }}
              />
              {fetchEnabled && isFetching && (
                <div className="mt-1 flex items-center gap-2 text-sm text-purple-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching username...
                </div>
              )}
              {fetchEnabled && fetchedUsername && !isFetching && (
                <div className="mt-1 text-sm text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Username: {fetchedUsername}
                </div>
              )}
              {fetchEnabled && fetchError && !isFetching && (
                <div className="mt-1 text-sm text-red-400">
                  {fetchError}
                </div>
              )}
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
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Referral Discount (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter discount code"
                  className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  disabled={!!discountApplied}
                />
                {!discountApplied ? (
                  <button
                    onClick={handleApplyDiscount}
                    disabled={isVerifyingDiscount || !discountCode.trim()}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isVerifyingDiscount ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply'}
                  </button>
                ) : (
                  <button
                    onClick={handleRemoveDiscount}
                    className="px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-bold hover:bg-red-500/20 transition-all"
                  >
                    Remove
                  </button>
                )}
              </div>
              {discountError && <p className="text-sm text-red-400 mt-1">{discountError}</p>}
              {discountApplied && (
                <p className="text-sm text-green-400 mt-1">✅ {discountApplied.code}: {discountApplied.amount} USDC off</p>
              )}
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
              disabled={isButtonDisabled}
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
