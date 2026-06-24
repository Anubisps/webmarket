'use client'
import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  CreditCard, Wallet, Globe, Zap, ToggleLeft, ToggleRight, Save, FlaskConical,
  Loader2, ChevronDown, ChevronUp, Key, ArrowLeft,
} from 'lucide-react'
import { AUTO_CAPABLE_METHODS, PROVIDER_FIELDS } from '@/lib/payments/processor'

interface PaymentSetting {
  id: string
  method: string
  label: string
  enabled: boolean
  instructions: string | null
  walletAddress: string | null
  mode: string
  config: Record<string, string> | null
  testMode: boolean
  supportsAuto: boolean
}

const METHOD_ICONS: Record<string, typeof CreditCard> = {
  stripe: CreditCard,
  paypal: Globe,
  coinbase: Zap,
  crypto: Wallet,
}

export default function PaymentSettingsUI({ initialSettings }: { initialSettings: PaymentSetting[] }) {
  const [settings, setSettings] = useState(
    initialSettings.map(s => ({
      ...s,
      config: (s.config as Record<string, string>) || {},
      mode: s.mode || 'manual',
    }))
  )
  const [expanded, setExpanded] = useState<string | null>(settings[0]?.id || null)
  const [saving, setSaving] = useState<string | null>(null)
  const [testing, setTesting] = useState<string | null>(null)

  const toggleEnabled = async (id: string, current: boolean) => {
    const res = await fetch('/api/admin/settings/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled: !current }),
    })
    if (res.ok) {
      setSettings(prev => prev.map(s => (s.id === id ? { ...s, enabled: !current } : s)))
      toast.success(!current ? 'Payment method enabled' : 'Payment method disabled')
    }
  }

  const saveSetting = async (setting: PaymentSetting) => {
    setSaving(setting.id)
    try {
      const res = await fetch('/api/admin/settings/payments/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: setting.id,
          instructions: setting.instructions,
          walletAddress: setting.walletAddress,
          mode: setting.mode,
          config: setting.config,
          testMode: setting.testMode,
        }),
      })
      if (res.ok) {
        toast.success(`${setting.label} saved`)
      } else {
        toast.error('Failed to save')
      }
    } finally {
      setSaving(null)
    }
  }

  const runTest = async (id: string) => {
    setTesting(id)
    try {
      const res = await fetch('/api/admin/settings/payments/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodId: id }),
      })
      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        toast.success(data.message || 'Opening test checkout...')
        window.open(data.checkoutUrl, '_blank')
      } else {
        toast.error(data.error || 'Test failed')
      }
    } finally {
      setTesting(null)
    }
  }

  const updateField = (id: string, field: string, value: unknown) => {
    setSettings(prev => prev.map(s => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const updateConfig = (id: string, key: string, value: string) => {
    setSettings(prev =>
      prev.map(s =>
        s.id === id ? { ...s, config: { ...s.config, [key]: value } } : s
      )
    )
  }

  const canAuto = (method: string) => AUTO_CAPABLE_METHODS.includes(method)

  return (
    <div className="text-white">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/accessadmin/settings"
            className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Settings
          </Link>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
            <CreditCard className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-medium text-gray-300">Payments</span>
          </div>
          <h1 className="text-3xl font-extrabold md:text-4xl">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Payment Gateways
            </span>
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Switch between automatic checkout and manual instructions per provider.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {settings.map(setting => {
          const Icon = METHOD_ICONS[setting.method] || CreditCard
          const isOpen = expanded === setting.id
          const fields = PROVIDER_FIELDS[setting.method] || []
          const autoAvailable = canAuto(setting.method)

          return (
            <div
              key={setting.id}
              className={`overflow-hidden rounded-2xl border backdrop-blur-lg transition ${
                setting.enabled
                  ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-white/[0.03]'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div
                className="flex cursor-pointer flex-wrap items-center justify-between gap-4 p-5"
                onClick={() => setExpanded(isOpen ? null : setting.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600/30 to-teal-600/30">
                    <Icon className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{setting.label}</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        setting.enabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {setting.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        setting.mode === 'auto' ? 'bg-violet-500/20 text-violet-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {setting.mode}
                      </span>
                      {setting.testMode && (
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                          Test mode
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={e => { e.stopPropagation(); toggleEnabled(setting.id, setting.enabled) }}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      setting.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    {setting.enabled ? 'On' : 'Off'}
                  </button>
                  {isOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-white/5 p-5 space-y-5">
                  {autoAvailable && (
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                      <div>
                        <p className="font-medium">Processing mode</p>
                        <p className="text-sm text-gray-400">
                          Auto redirects customers to checkout. Manual shows your payment instructions.
                        </p>
                      </div>
                      <button
                        onClick={() => updateField(setting.id, 'mode', setting.mode === 'auto' ? 'manual' : 'auto')}
                        className="flex items-center gap-2 rounded-xl bg-black/30 px-4 py-2 font-medium capitalize"
                      >
                        {setting.mode === 'auto' ? (
                          <><ToggleRight className="h-5 w-5 text-violet-400" /> Auto</>
                        ) : (
                          <><ToggleLeft className="h-5 w-5 text-blue-400" /> Manual</>
                        )}
                      </button>
                    </div>
                  )}

                  {setting.mode === 'auto' && autoAvailable && (
                    <>
                      <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <div>
                          <p className="font-medium text-amber-200">Test mode</p>
                          <p className="text-sm text-gray-400">Simulate payments without real charges</p>
                        </div>
                        <button
                          onClick={() => updateField(setting.id, 'testMode', !setting.testMode)}
                          className={`rounded-xl px-4 py-2 text-sm font-medium ${
                            setting.testMode ? 'bg-amber-500/30 text-amber-200' : 'bg-white/10 text-gray-400'
                          }`}
                        >
                          {setting.testMode ? 'Test ON' : 'Test OFF'}
                        </button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {fields.map(field => (
                          <div key={field.key}>
                            <label className="mb-1 flex items-center gap-1 text-sm text-gray-400">
                              <Key className="h-3 w-3" /> {field.label}
                            </label>
                            <input
                              type={field.secret ? 'password' : 'text'}
                              value={setting.config?.[field.key] || ''}
                              onChange={e => updateConfig(setting.id, field.key, e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none"
                              placeholder={field.label}
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => runTest(setting.id)}
                        disabled={testing === setting.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/20 disabled:opacity-50"
                      >
                        {testing === setting.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FlaskConical className="h-4 w-4" />
                        )}
                        Run test checkout ($1.00 simulated)
                      </button>
                    </>
                  )}

                  {(setting.mode === 'manual' || !autoAvailable) && (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-sm text-gray-400">Payment instructions</label>
                        <textarea
                          rows={4}
                          value={setting.instructions || ''}
                          onChange={e => updateField(setting.id, 'instructions', e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-blue-500/50 focus:outline-none"
                          placeholder="Tell customers how to pay (account details, steps, etc.)"
                        />
                      </div>
                      {(setting.method === 'crypto' || setting.walletAddress) && (
                        <div>
                          <label className="mb-1 block text-sm text-gray-400">Wallet address</label>
                          <input
                            value={setting.walletAddress || ''}
                            onChange={e => updateField(setting.id, 'walletAddress', e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-white focus:border-blue-500/50 focus:outline-none"
                            placeholder="BTC / ETH / USDT address"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => saveSetting(setting)}
                    disabled={saving === setting.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-bold transition hover:scale-[1.02] disabled:opacity-50"
                  >
                    {saving === setting.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save {setting.label}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
