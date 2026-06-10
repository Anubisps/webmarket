'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Email state
  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerificationInput, setShowVerificationInput] = useState(false)

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderUpdates, setOrderUpdates] = useState(true)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email)
    }
  }, [session])

  const getCsrfToken = () => {
    if (typeof document === 'undefined') return ''
    return document.cookie
      .split(';')
      .find(c => c.trim().startsWith('csrf_token='))
      ?.split('=')[1] || ''
  }

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMounted) return
    setLoading(true)

    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (newEmail === email) {
      toast.error('New email must be different from current email')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/user/request-email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken()
        },
        body: JSON.stringify({ newEmail })
      })

      if (res.ok) {
        toast.success('Verification code sent to your new email!')
        setShowVerificationInput(true)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to send verification code')
      }
    } catch (err) {
      toast.error('Network error – please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMounted) return
    setLoading(true)

    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/user/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken()
        },
        body: JSON.stringify({ token: verificationCode.trim() })
      })

      if (res.ok) {
        toast.success('✅ Email verified and updated!')
        setShowVerificationInput(false)
        setVerificationCode('')
        setNewEmail('')
        // ✅ Update the session token with the new email – NO REFRESH LOOP
        await update({ email: newEmail })
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Invalid verification code')
      }
    } catch (err) {
      toast.error('Network error – please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMounted) return
    setLoading(true)

    const { currentPassword, newPassword, confirmPassword } = passwordData

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken()
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      if (res.ok) {
        toast.success('✅ Password Updated Successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update password')
      }
    } catch (err) {
      toast.error('Network error – please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken()
        },
        body: JSON.stringify({ emailNotifications, orderUpdates })
      })
      if (res.ok) {
        toast.success('✅ Notification Preferences Saved!')
      } else {
        toast.error('Failed to save preferences')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  const firstLetter = session?.user?.username?.charAt(0).toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <User className="w-8 h-8 text-purple-600" />
          Profile Settings
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold mb-4">
                  {firstLetter}
                </div>
                <h2 className="text-xl font-bold mt-4">{session?.user?.username || 'User'}</h2>
                <p className="text-gray-400 text-sm">{session?.user?.email}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">Role: {session?.user?.role || 'user'}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Email Settings */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Email Address
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Current email: <strong>{email}</strong>
              </p>

              {!showVerificationInput ? (
                <form onSubmit={handleRequestEmailChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-400">New Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Change Email'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                  <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
                    <p className="text-sm text-yellow-300">
                      Verification code sent to <strong>{newEmail}</strong>. Please check your inbox.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-400">Verification Code</label>
                    <input
                      type="text"
                      required
                      placeholder="123456"
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Update Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVerificationInput(false)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>

            {/* Password Settings */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                Change Password
              </h2>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/5 cursor-pointer transition-colors hover:bg-black/40">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                    className="w-5 h-5 accent-purple-500"
                  />
                  <span className="text-sm">Receive email notifications</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/5 cursor-pointer transition-colors hover:bg-black/40">
                  <input
                    type="checkbox"
                    checked={orderUpdates}
                    onChange={() => setOrderUpdates(!orderUpdates)}
                    className="w-5 h-5 accent-purple-500"
                  />
                  <span className="text-sm">Receive order status updates</span>
                </label>
                <button
                  onClick={handleSaveNotifications}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all"
                >
                  Save Preferences
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                Account Information
              </h2>
              <div className="space-y-2 text-gray-300">
                <p><strong className="text-white">Username:</strong> {session?.user?.username}</p>
                <p><strong className="text-white">Email:</strong> {session?.user?.email}</p>
                <p><strong className="text-white">Role:</strong> <span className="capitalize">{session?.user?.role || 'user'}</span></p>
                <p><strong className="text-white">Member since:</strong> {session?.user?.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
