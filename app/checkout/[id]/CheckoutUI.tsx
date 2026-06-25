'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, CreditCard, User, Mail, ArrowRight, Loader2, Tag, AlertCircle, ShoppingBag, Shield, Sparkles, RefreshCw, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPriceLabel } from '@/lib/formatPrice'

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
  variants?: { id: string; name: string; price?: number }[]
  methods: PaymentMethod[]
  userId: string
  fetchEnabled: boolean
  fetchProvider: string
  gameIdLabel: string
  subscriptionId?: string
  subscriptionEnabled?: boolean
  subscriptionBillingLabel?: string
  subscriptionIntervalDays?: number
  loyalty?: {
    qualified: boolean
    discountPercent: number
    spent: number
    threshold: number
    remaining: number
  }
}

export default function CheckoutUI({
  productId,
  productName,
  price,
  variants = [],
  methods,
  userId,
  fetchEnabled,
  fetchProvider,
  gameIdLabel,
  subscriptionId,
  subscriptionEnabled = false,
  subscriptionBillingLabel = 'Monthly',
  subscriptionIntervalDays = 30,
  loyalty,
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
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [wantsSubscription, setWantsSubscription] = useState(false)
  const [commitmentYears, setCommitmentYears] = useState(1)
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const selectedVariant = variants.find(v => v.id === selectedVariantId)
  const unitPrice = selectedVariant?.price ?? price

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

  const loyaltyDiscount = loyalty?.qualified
    ? unitPrice * (loyalty.discountPercent / 100)
    : 0
  const finalPrice = Math.max(unitPrice - (discountApplied?.amount || 0) - loyaltyDiscount, 0)

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
        body: JSON.stringify({ code: discountCode.trim(), productId })
      })
      const data = await res.json()
      if (res.ok && data.valid) {
        setDiscountApplied({ amount: data.discount, code: discountCode.trim() })
        const label = data.discountType === 'percent'
          ? `${data.rawDiscount}% off`
          : `$${data.discount.toFixed(2)} off`
        toast.success(`Discount applied: ${label}`)
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
          referralCode: null,
          variantId: selectedVariantId || null,
          subscriptionId: subscriptionId || null,
          wantsSubscription: subscriptionEnabled ? wantsSubscription : false,
          subscriptionCommitmentYears: subscriptionEnabled && wantsSubscription ? commitmentYears : null,
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
                <p className="text-sm text-green-400">Discount applied: {formatPriceLabel(discountApplied.amount)}</p>
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
    <div className="min-h-screen bg-[#0a0a0f] py-10 text-white md:py-14">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[55%] w-[55%] rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[55%] w-[55%] rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <p className="mb-2 text-sm text-gray-500">Secure checkout</p>
          <h1 className="flex items-center gap-2 text-3xl font-extrabold md:text-4xl">
            <Sparkles className="h-8 w-8 text-violet-400" />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Complete Purchase
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Main form */}
          <div className="space-y-5 lg:col-span-3">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
              <h2 className="mb-4 flex items-center gap-2 font-bold">
                <User className="h-5 w-5 text-violet-400" />
                Delivery details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">{gameIdLabel}{fetchEnabled ? ' (numbers only)' : ''}</label>
                  <input
                    type="text"
                    required
                    pattern={fetchEnabled ? '[0-9]*' : undefined}
                    inputMode={fetchEnabled ? 'numeric' : 'text'}
                    placeholder={fetchEnabled ? 'e.g., 123456789' : 'Enter your player ID or IGN'}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    value={ign}
                    onChange={(e) => {
                      const value = fetchEnabled ? e.target.value.replace(/\D/g, '') : e.target.value
                      setIgn(value)
                    }}
                  />
                  {fetchEnabled && isFetching && (
                    <p className="mt-1 flex items-center gap-2 text-sm text-violet-400">
                      <Loader2 className="h-4 w-4 animate-spin" /> Fetching username...
                    </p>
                  )}
                  {fetchEnabled && fetchedUsername && !isFetching && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-emerald-400">
                      <CheckCircle className="h-4 w-4" /> Username: {fetchedUsername}
                    </p>
                  )}
                  {fetchEnabled && fetchError && !isFetching && (
                    <p className="mt-1 text-sm text-rose-400">{fetchError}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Contact email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {variants.length > 0 && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
                <h2 className="mb-4 font-bold">Product option</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {variants.map(v => (
                    <label
                      key={v.id}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${
                        selectedVariantId === v.id ? 'border-violet-500/50 bg-violet-500/10' : 'border-white/10 bg-black/20'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="variant"
                          checked={selectedVariantId === v.id}
                          onChange={() => setSelectedVariantId(v.id)}
                        />
                        {v.name}
                      </span>
                      <span className="text-sm text-violet-300">{formatPriceLabel(v.price ?? price)}</span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {subscriptionEnabled && (
              <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 backdrop-blur-lg">
                <h2 className="mb-4 flex items-center gap-2 font-bold">
                  <RefreshCw className="h-5 w-5 text-cyan-400" />
                  Subscription
                </h2>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <input
                    type="checkbox"
                    checked={wantsSubscription}
                    onChange={e => setWantsSubscription(e.target.checked)}
                    className="mt-1 accent-cyan-500"
                  />
                  <div>
                    <p className="font-medium">Subscribe to auto-renewal</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Billed {subscriptionBillingLabel.toLowerCase()} ({subscriptionIntervalDays} days) after this order is paid.
                    </p>
                  </div>
                </label>
                {wantsSubscription && (
                  <div className="mt-4">
                    <label className="mb-2 block text-sm text-gray-400">Commitment period</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map(years => (
                        <button
                          key={years}
                          type="button"
                          onClick={() => setCommitmentYears(years)}
                          className={`rounded-xl border px-3 py-2 text-sm transition ${
                            commitmentYears === years
                              ? 'border-cyan-500/50 bg-cyan-500/20 text-white'
                              : 'border-white/10 bg-black/20 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          {years} year{years > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      You commit to this subscription for {commitmentYears} year{commitmentYears > 1 ? 's' : ''}. Renewals continue until the commitment ends.
                    </p>
                  </div>
                )}
              </section>
            )}

            {loyalty && (
              <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-lg">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    {loyalty.qualified ? (
                      <>
                        <p className="font-medium text-emerald-300">Loyalty reward active</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {loyalty.discountPercent}% off applied — you&apos;ve spent ${loyalty.spent.toFixed(2)} with us.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-gray-300">Loyalty program</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Spend ${loyalty.remaining.toFixed(2)} more (paid orders) to unlock {loyalty.discountPercent > 0 ? `${loyalty.discountPercent}% off` : 'rewards'}.
                          Current: ${loyalty.spent.toFixed(2)} / ${loyalty.threshold.toFixed(2)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
              <h2 className="mb-4 flex items-center gap-2 font-bold">
                <Tag className="h-5 w-5 text-amber-400" />
                Discount code
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  disabled={!!discountApplied}
                />
                {!discountApplied ? (
                  <button
                    onClick={handleApplyDiscount}
                    disabled={isVerifyingDiscount || !discountCode.trim()}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 font-bold text-gray-900 disabled:opacity-50"
                  >
                    {isVerifyingDiscount ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Apply'}
                  </button>
                ) : (
                  <button onClick={handleRemoveDiscount} className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-rose-300">
                    Remove
                  </button>
                )}
              </div>
              {discountError && <p className="mt-2 text-sm text-rose-400">{discountError}</p>}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
              <h2 className="mb-4 flex items-center gap-2 font-bold">
                <CreditCard className="h-5 w-5 text-cyan-400" />
                Payment method
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {methods.map(method => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                      selectedMethod === method.id
                        ? 'border-violet-500/50 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                        : 'border-white/10 bg-black/20 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={() => setSelectedMethod(method.id)}
                      className="accent-violet-500"
                    />
                    <span className="font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              onClick={handlePlaceOrder}
              disabled={isButtonDisabled}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 py-4 font-bold shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? 'Processing...' : <>Place Order · {formatPriceLabel(finalPrice)} <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-6 backdrop-blur-lg">
              <h2 className="mb-4 flex items-center gap-2 font-bold">
                <ShoppingBag className="h-5 w-5 text-violet-400" />
                Order summary
              </h2>
              <p className="mb-1 text-lg font-bold">{productName}</p>
              <div className="mb-4 space-y-2 border-b border-white/10 pb-4 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPriceLabel(unitPrice)}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({discountApplied.code})</span>
                    <span>-{formatPriceLabel(discountApplied.amount)}</span>
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Loyalty ({loyalty?.discountPercent}%)</span>
                    <span>-{formatPriceLabel(loyaltyDiscount)}</span>
                  </div>
                )}
                {wantsSubscription && subscriptionEnabled && (
                  <div className="flex justify-between text-cyan-400 text-xs">
                    <span>Subscription</span>
                    <span>{commitmentYears}yr · {subscriptionBillingLabel}</span>
                  </div>
                )}
              </div>
              <div className="mb-6 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  {formatPriceLabel(finalPrice)}
                </span>
              </div>
              <p className="flex items-start gap-2 text-xs text-gray-500">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                Encrypted checkout · Your game ID is used only to deliver this order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
