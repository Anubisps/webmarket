'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Gift, Users, DollarSign, Calendar, Edit, Save, TrendingUp, Plus, Minus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminAffiliateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [affiliate, setAffiliate] = useState<any>(null)
  const [commission, setCommission] = useState(0)
  const [balanceAdjustment, setBalanceAdjustment] = useState(0)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function fetchAffiliate() {
      try {
        const res = await fetch(`/api/admin/affiliates/${id}`)
        const data = await res.json()
        setAffiliate(data)
        setCommission(data.commission)
      } catch (err) {
        toast.error('Failed to load affiliate')
      } finally {
        setLoading(false)
      }
    }
    fetchAffiliate()
  }, [id])

  const handleUpdateCommission = async () => {
    if (commission < 0 || commission > 100) {
      toast.error('Commission must be between 0 and 100')
      return
    }
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/affiliates/${id}/commission`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commission })
      })
      if (res.ok) {
        toast.success('Commission updated successfully')
        setAffiliate((prev: any) => ({ ...prev, commission }))
      } else {
        toast.error('Failed to update commission')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setUpdating(false)
    }
  }

  const handleAdjustBalance = async () => {
    if (balanceAdjustment === 0) {
      toast.error('Please enter a valid amount')
      return
    }
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/affiliates/${id}/balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustment: balanceAdjustment })
      })
      if (res.ok) {
        toast.success('Balance updated successfully')
        setAffiliate((prev: any) => ({ ...prev, balance: prev.balance + balanceAdjustment }))
        setBalanceAdjustment(0)
      } else {
        toast.error('Failed to update balance')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading affiliate details...</p>
        </div>
      </div>
    )
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Affiliate not found</h1>
          <Link href="/accessadmin/affiliates" className="text-purple-400 hover:underline">
            ← Back to Affiliates
          </Link>
        </div>
      </div>
    )
  }

  const totalEarnings = affiliate.referrals.reduce((sum: number, r: any) => sum + r.commission, 0)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Gift className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium text-gray-300">Affiliate</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {affiliate.user.username}
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Affiliate analytics and tools.</p>
        </div>
        <Link
          href="/accessadmin/affiliates"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all mt-4 md:mt-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Affiliates
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-400" />
            <h2 className="text-lg font-bold">Affiliate Information</h2>
          </div>
          <div className="space-y-2 text-gray-300">
            <p><strong>Username:</strong> {affiliate.user.username}</p>
            <p><strong>Email:</strong> {affiliate.user.email}</p>
            <p><strong>Code:</strong> <span className="text-yellow-400 font-mono">{affiliate.code}</span></p>
            <p><strong>Commission:</strong> <span className="text-emerald-400">{affiliate.commission}%</span></p>
            <p><strong>Balance:</strong> <span className="text-yellow-400 font-bold">${affiliate.balance.toFixed(2)}</span></p>
            <p><strong>Joined:</strong> {new Date(affiliate.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <h2 className="text-lg font-bold">Earnings</h2>
          </div>
          <div className="space-y-2">
            <p><strong>Total Earnings:</strong> <span className="text-yellow-400 font-bold">${totalEarnings.toFixed(2)}</span></p>
            <p><strong>Referrals:</strong> <span className="text-blue-400 font-bold">{affiliate.referrals.length}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Referral History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="px-4 py-2 text-left text-sm text-gray-400">Order ID</th>
                <th className="px-4 py-2 text-left text-sm text-gray-400">Customer</th>
                <th className="px-4 py-2 text-left text-sm text-gray-400">Commission</th>
                <th className="px-4 py-2 text-left text-sm text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {affiliate.referrals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No referrals yet</p>
                  </td>
                </tr>
              ) : (
                affiliate.referrals.map((ref: any) => (
                  <tr key={ref.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-2 text-sm font-mono">#{ref.order.id.slice(0,8)}</td>
                    <td className="px-4 py-2 text-sm">{ref.order.user?.username || 'Unknown'}</td>
                    <td className="px-4 py-2 text-sm text-emerald-400">${ref.commission.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-gray-400">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Edit className="w-5 h-5 text-purple-400" />
          Tools
        </h2>
        <div className="space-y-6">
          {/* Update Commission */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Update Commission Rate (%)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={commission}
                onChange={(e) => setCommission(parseFloat(e.target.value))}
                className="w-32 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white"
              />
              <button
                onClick={handleUpdateCommission}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4 inline mr-1" />
                {updating ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Adjust Balance */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Adjust Balance (USDC)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={balanceAdjustment}
                onChange={(e) => setBalanceAdjustment(parseFloat(e.target.value))}
                className="w-32 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white"
              />
              <button
                onClick={handleAdjustBalance}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all disabled:opacity-50"
              >
                {balanceAdjustment > 0 ? <Plus className="w-4 h-4 inline mr-1" /> : <Minus className="w-4 h-4 inline mr-1" />}
                {updating ? 'Saving...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
