'use client'
import { useState } from 'react'
import { Sparkles, Save, Globe, Tag, Shield, Mail, Smartphone, Lock, Box } from 'lucide-react'

interface SiteSetting {
  id: string
  key: string
  value: string | null
  type: string
  label: string
  category: string
}

export default function GeneralSettingsUI({ initialSettings }: { initialSettings: SiteSetting[] }) {
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const categories = Array.from(new Set(settings.map(s => s.category)))

  const saveSettings = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })
      if (res.ok) {
        setMessage('✅ Settings saved successfully')
      } else {
        setMessage('❌ Failed to save settings')
      }
    } catch (err) {
      setMessage('❌ Network error')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (id: string, value: string) => {
    setSettings(settings.map(s => s.id === id ? { ...s, value } : s))
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Globe className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300">Settings</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">General</span> Settings
          </h1>
          <p className="text-gray-400 text-lg">Configure your store's global settings.</p>
        </div>
      </div>

      {/* ===== ALERT ===== */}
      {message && <p className="mb-4 text-emerald-400">{message}</p>}

      {/* ===== SETTINGS FORM ===== */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        {categories.map(cat => (
          <div key={cat} className="mb-8 last:mb-0">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-200">
              {cat === 'general' && <Box className="w-5 h-5 text-purple-400" />}
              {cat === 'social' && <Globe className="w-5 h-5 text-blue-400" />}
              {cat === 'system' && <Lock className="w-5 h-5 text-red-400" />}
              {cat === 'email' && <Mail className="w-5 h-5 text-yellow-400" />}
              {cat === 'seo' && <Tag className="w-5 h-5 text-emerald-400" />}
              {cat === 'security' && <Shield className="w-5 h-5 text-cyan-400" />}
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings
                .filter(s => s.category === cat)
                .map(setting => (
                  <div key={setting.id} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-400">{setting.label}</label>
                    {setting.type === 'boolean' ? (
                      <select
                        value={setting.value === 'true' ? 'true' : 'false'}
                        onChange={e => updateSetting(setting.id, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    ) : setting.type === 'textarea' ? (
                      <textarea
                        value={setting.value || ''}
                        onChange={e => updateSetting(setting.id, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        rows={3}
                      />
                    ) : (
                      <input
                        type={setting.type === 'text' ? 'text' : 'text'}
                        value={setting.value || ''}
                        onChange={e => updateSetting(setting.id, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
        <div className="mt-6 pt-6 border-t border-white/5">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save All Settings'} <Save className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
