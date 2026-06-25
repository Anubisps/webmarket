'use client'
import { useState, useEffect } from 'react'
import { Sparkles, Shield, Lock, Smartphone, Globe, Clock, CheckCircle, XCircle, AlertCircle, Save, Box } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SecurityPage() {
  const [settings, setSettings] = useState({
    twoFactor: true,
    rateLimiting: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    allowDiscountStacking: false,
    discordWebhookUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings/security')
        const data = await res.json()
        if (data) {
          setSettings({
            twoFactor: data.enable_2fa === 'true',
            rateLimiting: data.rate_limiting === 'true',
            sessionTimeout: parseInt(data.session_timeout) || 30,
            maxLoginAttempts: parseInt(data.max_login_attempts) || 5,
            allowDiscountStacking: data.allow_discount_stacking === 'true',
            discordWebhookUrl: data.discord_webhook_url || '',
          })
        }
      } catch (error) {
        toast.error('Failed to load security settings')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        toast.success('✅ Security settings saved successfully!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save settings')
      }
    } catch (err) {
      toast.error('Network error – please try again')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading settings...</div>
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-gray-300">Security</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Security</span> Settings
          </h1>
          <p className="text-gray-400 text-lg">Configure your store's security options.</p>
        </div>
      </div>

      {/* ===== SETTINGS FORM ===== */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-gray-400">Require 2FA for all admin users</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.twoFactor}
              onChange={e => setSettings({ ...settings, twoFactor: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-r from-cyan-500 to-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Rate Limiting</p>
            <p className="text-sm text-gray-400">Protect against brute force attacks</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.rateLimiting}
              onChange={e => setSettings({ ...settings, rateLimiting: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-r from-cyan-500 to-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>

        <div>
          <p className="font-medium mb-1">Session Timeout (minutes)</p>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={e => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
            className="w-24 px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>

        <div>
          <p className="font-medium mb-1">Max Login Attempts</p>
          <input
            type="number"
            value={settings.maxLoginAttempts}
            onChange={e => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
            className="w-24 px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Allow coupon + referral stacking</p>
            <p className="text-sm text-gray-400">When off, referral discount is skipped if a coupon is applied</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowDiscountStacking}
              onChange={e => setSettings({ ...settings, allowDiscountStacking: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-r from-cyan-500 to-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>

        <div>
          <p className="font-medium mb-1">Discord webhook URL (order/ticket notifications)</p>
          <input
            type="url"
            value={settings.discordWebhookUrl}
            onChange={e => setSettings({ ...settings, discordWebhookUrl: e.target.value })}
            placeholder="https://discord.com/api/webhooks/..."
            className="w-full px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-white"
          />
        </div>

        <div className="pt-4 border-t border-white/5">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Security Settings'} <Save className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
