'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, Shield, Smartphone, Globe, Clock } from 'lucide-react'

export default function TwoFactorSetupPage() {
  const router = useRouter()
  const [secret, setSecret] = useState('')
  const [otpauth, setOtpauth] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [deviceName, setDeviceName] = useState('')
  const [deviceInfo, setDeviceInfo] = useState<any>(null)

  useEffect(() => {
    // Get device info
    const userAgent = navigator.userAgent
    const platform = navigator.platform
    setDeviceInfo({ userAgent, platform })

    fetch('/api/auth/2fa/setup')
      .then(res => res.json())
      .then(data => {
        setSecret(data.secret)
        setOtpauth(data.otpauth)
        setQrCodeUrl(data.qrCodeUrl)
      })
      .catch(() => toast.error('Failed to load 2FA setup'))
  }, [])

  const verifyToken = async () => {
    if (!token) {
      toast.error('Please enter the code from your authenticator app')
      return
    }
    if (!deviceName.trim()) {
      toast.error('Please enter a device name')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          secret,
          deviceName: deviceName.trim(),
          userAgent: deviceInfo?.userAgent || '',
          platform: deviceInfo?.platform || ''
        })
      })
      if (res.ok) {
        toast.success('✅ 2FA enabled successfully!')
        router.push('/dashboard/security')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Invalid token')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center text-purple-600 mb-6 hover:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Security
      </button>

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Shield className="w-8 h-8 text-purple-600" />
        Set Up Two-Factor Authentication
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        <p className="text-gray-600 dark:text-gray-400">
          Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code to enable 2FA.
        </p>

        <div className="flex justify-center">
          <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 border rounded-lg" />
        </div>

        <div>
          <p className="text-sm text-gray-500">Secret key (manual entry):</p>
          <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 break-all text-sm">
            {secret}
          </code>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Device Name
          </label>
          <input
            type="text"
            placeholder="e.g., My iPhone 15"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            value={deviceName}
            onChange={e => setDeviceName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Enter the 6-digit code from your app</label>
          <input
            type="text"
            placeholder="123456"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            value={token}
            onChange={e => setToken(e.target.value)}
          />
        </div>

        <button
          onClick={verifyToken}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 font-semibold"
        >
          {loading ? 'Verifying...' : 'Enable 2FA'}
        </button>
      </div>
    </div>
  )
}
