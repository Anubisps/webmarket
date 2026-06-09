'use client'
import { useState, useEffect } from 'react'
import { Gift, DollarSign, Users, Copy, TrendingUp, Wallet, History, Share2, CheckCircle, XCircle, ExternalLink, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AffiliateDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/affiliate/user-dashboard')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error('Failed to load affiliate data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success('CODE COPIED')
    }).catch(() => {
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('CODE COPIED')
    })
  }

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      toast.success('LINK COPIED')
    } catch (err) {
      const textArea = document.createElement('textarea')
      textArea.value = link
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('LINK COPIED')
    }
  }

  const handleClaimReward = () => {
    setShowPopup(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading affiliate data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-400">Data not available</h2>
          <p className="text-gray-400">Please try again later.</p>
        </div>
      </div>
    )
  }

  const { affiliate, referredUsers, totalEarnings, totalReferrals, totalReferredUsers, totalPurchased, totalPending, referralLink, balance } = data

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Gift className="w-8 h-8 text-purple-600" />
        Affiliate Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Referral Code</p>
            <button
              onClick={() => handleCopyCode(affiliate.code)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-2xl font-bold mt-2 text-purple-400">{affiliate.code}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <p className="text-sm text-gray-400">Commission Rate</p>
          <p className="text-2xl font-bold mt-2 text-emerald-400">{affiliate.commission}%</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <p className="text-sm text-gray-400">Total Earnings</p>
          <p className="text-2xl font-bold mt-2 text-yellow-400">${totalEarnings.toFixed(2)}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <p className="text-sm text-gray-400">Available Balance</p>
          <p className="text-2xl font-bold mt-2 text-emerald-400">${balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Referral Tracking
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-black/30 rounded-xl border border-white/5">
              <span className="text-gray-400">Total People Invited</span>
              <span className="font-bold text-white">{totalReferredUsers}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black/30 rounded-xl border border-white/5">
              <span className="text-gray-400">Purchased</span>
              <span className="font-bold text-emerald-400">{totalPurchased}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black/30 rounded-xl border border-white/5">
              <span className="text-gray-400">Pending</span>
              <span className="font-bold text-yellow-400">{totalPending}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-400" />
            Share Your Link
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Share your referral link with friends and earn {affiliate.commission}% commission on their purchases.
          </p>
          <div className="bg-black/30 rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400">Your referral link:</p>
            <code className="block bg-black/50 p-3 rounded mt-1 break-all text-sm text-purple-400">
              {referralLink}
            </code>
          </div>
          <button
            onClick={() => handleCopyLink(referralLink)}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            <ExternalLink className="w-4 h-4 inline mr-2" />
            Copy Link
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          People You've Invited
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="px-4 py-2 text-left text-sm text-gray-400">Username</th>
                <th className="px-4 py-2 text-left text-sm text-gray-400">Joined</th>
                <th className="px-4 py-2 text-left text-sm text-gray-400">Status</th>
                <th className="px-4 py-2 text-left text-sm text-gray-400">Purchase Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {referredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No one has joined through your link yet.</p>
                  </td>
                </tr>
              ) : (
                referredUsers.map((referred: any) => {
                  const hasPurchased = referred.orders.length > 0
                  const totalSpent = referred.orders.reduce((sum: number, o: any) => sum + o.total, 0)
                  return (
                    <tr key={referred.id} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-2 text-sm">{referred.username}</td>
                      <td className="px-4 py-2 text-sm text-gray-400">
                        {new Date(referred.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {hasPurchased ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle className="w-4 h-4" /> Purchased
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-400">
                            <XCircle className="w-4 h-4" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {hasPurchased ? `$${totalSpent.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-yellow-400" />
          Claim Your Reward
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Once you have at least one referral who has made a purchase, you can claim a <strong className="text-emerald-400">30% discount</strong> on your next order.
        </p>
        <p className="text-gray-400 text-sm mb-2">
          You can claim your earnings anytime by creating a ticket.
        </p>
        <button
          onClick={handleClaimReward}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-105 transition-all"
        >
          <Gift className="w-4 h-4 inline mr-2" />
          Contact Payments
        </button>

        {/* Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-4">Contact Payments</h3>
              <p className="text-gray-300 mb-6">
                You can claim your earnings anytime by creating a ticket. Our support team will assist you with the payout process.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/dashboard/tickets/new"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-center hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition-all"
                >
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Create Ticket
                </Link>
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
