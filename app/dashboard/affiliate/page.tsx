'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Gift, Copy, Users, Share2, Wallet, History, CheckCircle, XCircle,
  Loader2, Sparkles, TrendingUp, MessageCircle, ArrowRight, ExternalLink,
} from 'lucide-react'
import { csrfHeaders } from '@/lib/csrfClient'

function AffiliateContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutNote, setPayoutNote] = useState('')

  useEffect(() => {
    fetch('/api/affiliate/user-dashboard')
      .then(async res => {
        const json = await res.json()
        if (!res.ok || !json.affiliate) throw new Error(json.error || 'Failed to load')
        setData(json)
      })
      .catch(err => setError(err.message || 'Failed to load affiliate data'))
      .finally(() => setLoading(false))
  }, [])

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copied`),
      () => toast.error('Copy failed')
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    )
  }

  if (error || !data?.affiliate) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-12 text-center">
        <p className="text-rose-300">{error || 'Data unavailable'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
        >
          Retry
        </button>
      </div>
    )
  }

  const {
    affiliate, referredUsers, totalEarnings, totalReferredUsers,
    totalPurchased, totalPending, referralLink, balance, referralAnalytics = [],
  } = data

  const requestPayout = async () => {
    const res = await fetch('/api/affiliate/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
      body: JSON.stringify({ amount: payoutAmount, note: payoutNote }),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success('Payout request submitted')
      setPayoutAmount('')
      window.location.reload()
    } else toast.error(json.error || 'Request failed')
  }

  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Referral Code', value: affiliate.code, color: 'text-violet-300', action: () => copy(affiliate.code, 'Code') },
          { label: 'Commission', value: `${affiliate.commission}%`, color: 'text-emerald-300' },
          { label: 'Total Earned', value: `$${totalEarnings.toFixed(2)}`, color: 'text-amber-300' },
          { label: 'Balance', value: `$${balance.toFixed(2)}`, color: 'text-cyan-300' },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
            <p className="text-xs uppercase tracking-wide text-gray-400">{stat.label}</p>
            <div className="mt-2 flex items-center justify-between">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              {stat.action && (
                <button onClick={stat.action} className="rounded-lg bg-white/10 p-2 hover:bg-white/20">
                  <Copy className="h-4 w-4 text-gray-300" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <Share2 className="h-5 w-5 text-violet-400" />
            Your Referral Link
          </h2>
          <p className="mb-4 text-sm text-gray-300">
            Share this link — earn {affiliate.commission}% when friends purchase.
          </p>
          <code className="block break-all rounded-xl border border-violet-500/20 bg-black/40 p-4 text-sm text-violet-300">
            {referralLink}
          </code>
          <button
            onClick={() => copy(referralLink, 'Link')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 font-medium transition hover:scale-[1.02]"
          >
            <ExternalLink className="h-4 w-4" /> Copy Link
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Performance
          </h2>
          <div className="space-y-3">
            {[
              { label: 'People Invited', value: totalReferredUsers },
              { label: 'Purchased', value: totalPurchased, color: 'text-emerald-400' },
              { label: 'Pending', value: totalPending, color: 'text-amber-400' },
            ].map(row => (
              <div key={row.label} className="flex justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
                <span className="text-gray-400">{row.label}</span>
                <span className={`font-bold ${row.color || 'text-white'}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Wallet className="h-5 w-5 text-amber-400" />
          Request payout
        </h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="number"
            step="0.01"
            max={balance}
            placeholder="Amount (USD)"
            value={payoutAmount}
            onChange={e => setPayoutAmount(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
          />
          <input
            placeholder="Note (optional)"
            value={payoutNote}
            onChange={e => setPayoutNote(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
          />
          <button onClick={requestPayout} className="rounded-xl bg-amber-600 px-5 py-2 font-medium">
            Submit request
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">Available balance: ${balance.toFixed(2)} USD</p>
      </div>

      {referralAnalytics.length > 0 && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 font-bold">Referral earnings by month</h2>
          <div className="space-y-2">
            {referralAnalytics.map((row: { month: string; commission: number }) => (
              <div key={row.month} className="flex justify-between rounded-lg bg-black/20 px-3 py-2 text-sm">
                <span>{row.month}</span>
                <span className="text-emerald-400">${row.commission.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Users className="h-5 w-5 text-cyan-400" />
          Referrals
        </h2>
        {referredUsers.length === 0 ? (
          <p className="py-8 text-center text-gray-400">No referrals yet — share your link to get started.</p>
        ) : (
          <div className="space-y-2">
            {referredUsers.map((u: any) => {
              const purchased = u.orders?.length > 0
              const spent = u.orders?.reduce((s: number, o: any) => s + o.total, 0) || 0
              return (
                <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
                  <span className="font-medium text-white">{u.username}</span>
                  <span className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                  {purchased ? (
                    <span className="flex items-center gap-1 text-sm text-emerald-400">
                      <CheckCircle className="h-4 w-4" /> ${spent.toFixed(2)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-amber-400">
                      <XCircle className="h-4 w-4" /> Pending
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6">
        <h2 className="mb-2 flex items-center gap-2 font-bold">
          <Wallet className="h-5 w-5 text-amber-400" />
          Claim Earnings
        </h2>
        <p className="mb-4 text-sm text-gray-300">
          Request a payout or your 30% referral discount via support ticket.
        </p>
        <button
          onClick={() => setShowPopup(true)}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-bold text-gray-900 transition hover:scale-[1.02]"
        >
          <Gift className="mr-2 inline h-4 w-4" />
          Contact Payments
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0f] p-8">
            <h3 className="mb-2 text-xl font-bold">Claim via Support</h3>
            <p className="mb-6 text-gray-400">Open a ticket and our team will process your payout or discount.</p>
            <div className="flex gap-3">
              <Link
                href="/dashboard/tickets/new"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 font-bold"
              >
                <MessageCircle className="h-4 w-4" /> Create Ticket
              </Link>
              <button onClick={() => setShowPopup(false)} className="rounded-xl bg-white/10 px-4 py-3">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function AffiliateDashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-10 md:py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-amber-600/10 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-violet-600/10 blur-3xl" />
      </div>
      <div className="container relative z-10 mx-auto max-w-5xl px-4">
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-extrabold md:text-4xl">
          <Sparkles className="h-8 w-8 text-amber-400" />
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-violet-400 bg-clip-text text-transparent">
            Affiliate Program
          </span>
        </h1>
        <p className="mb-8 text-gray-300">Earn commission on every referral purchase.</p>
        <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-400" />}>
          <AffiliateContent />
        </Suspense>
      </div>
    </div>
  )
}
