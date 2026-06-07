'use client'
import { useState } from 'react'

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
    <div>
      <h1 className="text-3xl font-bold mb-6">General Settings</h1>
      {message && <p className="mb-4">{message}</p>}
      <div className="bg-white rounded-xl shadow-md p-6">
        {categories.map(cat => (
          <div key={cat} className="mb-8">
            <h2 className="text-xl font-bold mb-4 capitalize">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings
                .filter(s => s.category === cat)
                .map(setting => (
                  <div key={setting.id} className="space-y-1">
                    <label className="block text-sm font-medium">{setting.label}</label>
                    {setting.type === 'boolean' ? (
                      <select
                        value={setting.value === 'true' ? 'true' : 'false'}
                        onChange={e => updateSetting(setting.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    ) : setting.type === 'textarea' ? (
                      <textarea
                        value={setting.value || ''}
                        onChange={e => updateSetting(setting.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows={3}
                      />
                    ) : (
                      <input
                        type={setting.type === 'text' ? 'text' : 'text'}
                        value={setting.value || ''}
                        onChange={e => updateSetting(setting.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
