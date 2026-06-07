'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PaymentSetting {
  id: string
  method: string
  label: string
  enabled: boolean
  instructions: string | null
  walletAddress: string | null
}

export default function PaymentSettingsUI({ initialSettings }: { initialSettings: PaymentSetting[] }) {
  const router = useRouter()
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
    <div>
      <h1 className="text-3xl font-bold mb-6">Payment Settings</h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Method</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Instructions</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {settings.map(setting => (
              <tr key={setting.id}>
                <td className="px-6 py-4 font-medium">{setting.label}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleEnabled(setting.id, setting.enabled)}
                    className={`px-3 py-1 rounded text-sm ${
                      setting.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {setting.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {editing === setting.id ? (
                    <div className="space-y-2">
                      <textarea
                        defaultValue={setting.instructions || ''}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Payment instructions"
                        id={`instructions-${setting.id}`}
                      />
                      <input
                        type="text"
                        defaultValue={setting.walletAddress || ''}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Wallet address (for crypto only)"
                        id={`wallet-${setting.id}`}
                      />
                      <button
                        onClick={() => {
                          const instr = (document.getElementById(`instructions-${setting.id}`) as HTMLTextAreaElement).value
                          const wallet = (document.getElementById(`wallet-${setting.id}`) as HTMLInputElement).value
                          saveDetails(setting.id, instr, wallet)
                        }}
                        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <span>{setting.instructions || 'No instructions'}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setEditing(editing === setting.id ? null : setting.id)}
                    className="text-blue-600 hover:underline"
                  >
                    {editing === setting.id ? 'Cancel' : 'Edit'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
