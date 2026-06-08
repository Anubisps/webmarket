'use client'
import { useState } from 'react'
import { Sparkles, Save, CreditCard, Wallet, Globe, Box, Edit, CheckCircle, XCircle } from 'lucide-react'

interface PaymentSetting {
  id: string
  method: string
  label: string
  enabled: boolean
  instructions: string | null
  walletAddress: string | null
}

export default function PaymentSettingsUI({ initialSettings }: { initialSettings: PaymentSetting[] }) {
  const [settings, setSettings] = useState(initialSettings)
  const [editing, setEditing] = useState<string | null>(null)

  const toggleEnabled = async (id: string, current: boolean) => {
    const res = await fetch('/api/admin/settings/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled: !current })
    })
    if (res.ok) {
      setSettings(settings.map(s => s.id === id ? { ...s, enabled: !current } : s))
    }
  }

  const saveDetails = async (id: string, instructions: string, walletAddress: string) => {
    const res = await fetch('/api/admin/settings/payments/details', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, instructions, walletAddress })
    })
    if (res.ok) {
      setSettings(settings.map(s => s.id === id ? { ...s, instructions, walletAddress } : s))
      setEditing(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-gray-300">Payments</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Payment</span> Settings
          </h1>
          <p className="text-gray-400 text-lg">Configure payment methods and instructions.</p>
        </div>
      </div>

      {/* ===== PAYMENT METHODS TABLE ===== */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Method</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Instructions</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {settings.map(setting => (
                <tr key={setting.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{setting.label}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleEnabled(setting.id, setting.enabled)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        setting.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {setting.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {editing === setting.id ? (
                      <div className="space-y-2">
                        <textarea
                          defaultValue={setting.instructions || ''}
                          className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          placeholder="Payment instructions"
                          id={`instructions-${setting.id}`}
                        />
                        <input
                          type="text"
                          defaultValue={setting.walletAddress || ''}
                          className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          placeholder="Wallet address (for crypto only)"
                          id={`wallet-${setting.id}`}
                        />
                        <button
                          onClick={() => {
                            const instr = (document.getElementById(`instructions-${setting.id}`) as HTMLTextAreaElement).value
                            const wallet = (document.getElementById(`wallet-${setting.id}`) as HTMLInputElement).value
                            saveDetails(setting.id, instr, wallet)
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition-all"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span>{setting.instructions || 'No instructions'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setEditing(editing === setting.id ? null : setting.id)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
                    >
                      <Edit className="w-3 h-3" />
                      {editing === setting.id ? 'Cancel' : 'Edit'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
