'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function SecurityPage() {
  const [settings, setSettings] = useState({
    twoFactor: true,
    rateLimiting: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
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
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Security Settings</h1>
      <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.twoFactor}
              onChange={e => setSettings({ ...settings, twoFactor: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Rate Limiting</p>
            <p className="text-sm text-gray-500">Protect against brute force attacks</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.rateLimiting}
              onChange={e => setSettings({ ...settings, rateLimiting: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>

        <div>
          <p className="font-medium mb-1">Session Timeout (minutes)</p>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={e => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
            className="w-24 px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <p className="font-medium mb-1">Max Login Attempts</p>
          <input
            type="number"
            value={settings.maxLoginAttempts}
            onChange={e => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
            className="w-24 px-3 py-2 border rounded-lg"
          />
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Security Settings'}
        </button>
      </div>
    </div>
  )
}
