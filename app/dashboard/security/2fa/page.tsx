'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function TwoFactorPage() {
  const [secret, setSecret] = useState('')
  const [otpauth, setOtpauth] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
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
      toast.error('Please enter the token from your authenticator app')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, secret })
      })
      if (res.ok) {
        toast.success('✅ 2FA enabled successfully!')
        setIsEnabled(true)
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
      <h1 className="text-3xl font-bold mb-6">Two-Factor Authentication</h1>
      <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
        <p className="text-gray-600">
          Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
        </p>
        <div className="flex justify-center">
          <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Secret key (manual entry):</p>
          <code className="block bg-gray-100 p-2 rounded mt-1 break-all">{secret}</code>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Enter the 6-digit code from your app</label>
          <input
            type="text"
            placeholder="123456"
            className="w-full px-4 py-2 border rounded-lg"
            value={token}
            onChange={e => setToken(e.target.value)}
          />
        </div>
        <button
          onClick={verifyToken}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Enable 2FA'}
        </button>
        {isEnabled && (
          <p className="text-green-600 font-medium">✅ 2FA is enabled for your account</p>
        )}
      </div>
    </div>
  )
}
