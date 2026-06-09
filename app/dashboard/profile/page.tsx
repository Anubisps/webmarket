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

  const [email, setEmail] = useState('')
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

  // Helper to extract active validation CSRF tokens dynamically
  const getCsrfToken = () => {
    if (typeof document === 'undefined') return ''
    return document.cookie
      .split(';')
      .find(c => c.trim().startsWith('csrf_token='))
      ?.split('=')[1] || ''
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMounted) return
    setLoading(true)

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken()
        },
        body: JSON.stringify({ email })
      })

      if (res.ok) {
        // ✅ Updates the browser cookie context safely without forcing layout loops
        await update({ email: email })
        toast.success('✅ Email Updated Successfully!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update email')
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
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
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
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Email Address
              </h2>
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Email'}
                </button>
              </form>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  )
}
