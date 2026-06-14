'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Eye, EyeOff, Shield, Bell, Loader2, Upload, X, Camera, Check, AlertCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  // Email state
  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerificationInput, setShowVerificationInput] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' })

  // Password state
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
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderUpdates, setOrderUpdates] = useState(true)
  const [notifStatus, setNotifStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' })
  const [notifLoaded, setNotifLoaded] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email)
    }
    const storedPhoto = localStorage.getItem('profile_photo')
    if (storedPhoto) {
      setPhotoUrl(storedPhoto)
    }
  }, [session])

  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await fetch('/api/user/notifications')
        const data = await res.json()
        if (res.ok) {
          setEmailNotifications(data.emailNotifications !== undefined ? data.emailNotifications : true)
          setOrderUpdates(data.orderUpdates !== undefined ? data.orderUpdates : true)
        }
      } catch (err) {
        console.error('Failed to load preferences:', err)
      } finally {
        setNotifLoaded(true)
      }
    }
    loadPreferences()
  }, [])

  const checkPasswordStrength = (pass: string) => {
    const requirements = {
      length: pass.length >= 6,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^a-zA-Z0-9]/.test(pass)
    }
    setPasswordRequirements(requirements)
    const strength = Object.values(requirements).filter(Boolean).length
    setPasswordStrength(strength)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPasswordData({ ...passwordData, newPassword: val })
    checkPasswordStrength(val)
  }

  const getCsrfToken = () => {
    if (typeof document === 'undefined') return ''
    return document.cookie
      .split(';')
      .find(c => c.trim().startsWith('csrf_token='))
      ?.split('=')[1] || ''
  }

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !isMounted) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Please upload an image under 2MB.')
      return
    }
    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/user/profile/photo', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        setPhotoUrl(data.photoUrl)
        localStorage.setItem('profile_photo', data.photoUrl)
        toast.success('✅ Profile picture updated!')
        await update()
        setTimeout(() => router.refresh(), 500)
      } else {
        toast.error('Failed to upload photo')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoUrl(null)
    localStorage.removeItem('profile_photo')
    toast.success('Profile photo removed')
  }

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMounted) return
    setEmailStatus({ type: 'loading', message: 'Sending verification code...' })
    if (!newEmail || !newEmail.includes('@')) {
      setEmailStatus({ type: 'error', message: 'Please enter a valid email address' })
      return
    }
    if (newEmail === email) {
      setEmailStatus({ type: 'error', message: 'New email must be different from current email' })
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
        setEmailStatus({ type: 'success', message: 'Verification code sent to your new email!' })
        setShowVerificationInput(true)
      } else {
        const data = await res.json()
        setEmailStatus({ type: 'error', message: data.error || 'Failed to send verification code' })
      }
    } catch (err) {
      setEmailStatus({ type: 'error', message: 'Network error – please try again' })
    }
  }

  const handleVerifyEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMounted) return
    setEmailStatus({ type: 'loading', message: 'Verifying code...' })
    if (!verificationCode.trim()) {
      setEmailStatus({ type: 'error', message: 'Please enter the verification code' })
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
        setEmailStatus({ type: 'success', message: '✅ Email verified and updated!' })
        setShowVerificationInput(false)
        setVerificationCode('')
        setNewEmail('')
        await update({ email: newEmail })
        toast.success('Email updated successfully!')
        setTimeout(() => router.refresh(), 1500)
      } else {
        const data = await res.json()
        setEmailStatus({ type: 'error', message: data.error || 'Invalid verification code' })
      }
    } catch (err) {
      setEmailStatus({ type: 'error', message: 'Network error – please try again' })
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMounted) return
    setPasswordStatus({ type: 'loading', message: 'Updating password...' })
    const { currentPassword, newPassword, confirmPassword } = passwordData
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters' })
      return
    }
    if (newPassword === currentPassword) {
      setPasswordStatus({ type: 'error', message: 'New password must be different from current password' })
      return
    }
    if (passwordStrength < 3) {
      setPasswordStatus({ type: 'error', message: 'Password is too weak. Please add uppercase, lowercase, numbers, or special characters.' })
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
        setPasswordStatus({ type: 'success', message: '✅ Password updated successfully!' })
        toast.success('Password updated successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setPasswordStrength(0)
        setPasswordRequirements({
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false
        })
      } else {
        const data = await res.json()
        setPasswordStatus({ type: 'error', message: data.error || 'Failed to update password' })
      }
    } catch (err) {
      setPasswordStatus({ type: 'error', message: 'Network error – please try again' })
    }
  }

  const handleSaveNotifications = async () => {
    setNotifStatus({ type: 'loading', message: 'Saving preferences...' })
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
        setNotifStatus({ type: 'success', message: '✅ Notification preferences saved!' })
        toast.success('Notification preferences saved')
      } else {
        setNotifStatus({ type: 'error', message: 'Failed to save preferences' })
      }
    } catch (err) {
      setNotifStatus({ type: 'error', message: 'Network error' })
    }
  }

  const firstLetter = session?.user?.username?.charAt(0).toUpperCase() || '?'

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500'
    if (passwordStrength <= 2) return 'bg-orange-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    if (passwordStrength <= 4) return 'bg-blue-500'
    return 'bg-emerald-500'
  }

  const getStrengthLabel = () => {
    if (passwordStrength <= 1) return 'Very Weak'
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 3) return 'Medium'
    if (passwordStrength <= 4) return 'Strong'
    return 'Very Strong'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-8">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Profile Settings
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT COLUMN – Profile + Notifications */}
          <div className="md:col-span-1 space-y-5">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col items-center relative group hover:bg-white/10 transition-all duration-300">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mb-3 relative overflow-hidden shadow-lg shadow-purple-500/20">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  firstLetter
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhotoUpload}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {uploadingPhoto ? '...' : 'Upload'}
                </button>
                {photoUrl && (
                  <button
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <h2 className="text-lg font-bold mt-2">{session?.user?.username || 'User'}</h2>
              <p className="text-xs text-gray-400">{session?.user?.email}</p>
              <p className="text-xs text-gray-500 capitalize mt-1">Role: {session?.user?.role || 'user'}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                Notifications
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-2 bg-black/30 rounded-lg border border-white/5 cursor-pointer transition-colors hover:bg-black/40">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                    className="w-4 h-4 accent-purple-500"
                  />
                  <span className="text-sm">Email notifications</span>
                </label>
                <label className="flex items-center gap-3 p-2 bg-black/30 rounded-lg border border-white/5 cursor-pointer transition-colors hover:bg-black/40">
                  <input
                    type="checkbox"
                    checked={orderUpdates}
                    onChange={() => setOrderUpdates(!orderUpdates)}
                    className="w-4 h-4 accent-purple-500"
                  />
                  <span className="text-sm">Order status updates</span>
                </label>
                <button
                  onClick={handleSaveNotifications}
                  disabled={notifStatus.type === 'loading' || !notifLoaded}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                >
                  {notifStatus.type === 'loading' ? (
                    <span className="flex items-center justify-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                    </span>
                  ) : (
                    'Save Preferences'
                  )}
                </button>
                {notifStatus.type !== 'idle' && (
                  <div className={`p-2 rounded-lg text-xs ${
                    notifStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                    notifStatus.type === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {notifStatus.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN – Email + Password */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Email Address
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Current: <span className="text-white">{email}</span>
              </p>

              {!showVerificationInput ? (
                <form onSubmit={handleRequestEmailChange} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400">New Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={emailStatus.type === 'loading'}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {emailStatus.type === 'loading' ? (
                      <span className="flex items-center justify-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Sending...
                      </span>
                    ) : (
                      'Change Email'
                    )}
                  </button>
                  {emailStatus.type !== 'idle' && (
                    <div className={`p-2 rounded-lg text-xs ${
                      emailStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                      emailStatus.type === 'error' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {emailStatus.message}
                    </div>
                  )}
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailChange} className="space-y-3">
                  <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                    <p className="text-xs text-yellow-300">
                      Code sent to <strong>{newEmail}</strong>
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400">Verification Code</label>
                    <input
                      type="text"
                      required
                      placeholder="123456"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={emailStatus.type === 'loading'}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {emailStatus.type === 'loading' ? (
                      <span className="flex items-center justify-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                      </span>
                    ) : (
                      'Verify & Update'
                    )}
                  </button>
                  {emailStatus.type !== 'idle' && (
                    <div className={`p-2 rounded-lg text-xs ${
                      emailStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                      emailStatus.type === 'error' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {emailStatus.message}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowVerificationInput(false)}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                Change Password
              </h3>
              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-400">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-400">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {passwordData.newPassword.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength ? getStrengthColor() : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400">Strength: {getStrengthLabel()}</span>
                      <div className="flex gap-1 flex-wrap">
                        <span className={`text-[8px] px-1 py-0.5 rounded ${passwordRequirements.length ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {passwordRequirements.length ? '✓' : '✗'} 6+ chars
                        </span>
                        <span className={`text-[8px] px-1 py-0.5 rounded ${passwordRequirements.uppercase ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {passwordRequirements.uppercase ? '✓' : '✗'} A-Z
                        </span>
                        <span className={`text-[8px] px-1 py-0.5 rounded ${passwordRequirements.lowercase ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {passwordRequirements.lowercase ? '✓' : '✗'} a-z
                        </span>
                        <span className={`text-[8px] px-1 py-0.5 rounded ${passwordRequirements.number ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {passwordRequirements.number ? '✓' : '✗'} 0-9
                        </span>
                        <span className={`text-[8px] px-1 py-0.5 rounded ${passwordRequirements.special ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {passwordRequirements.special ? '✓' : '✗'} !@#$
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-400">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordStatus.type === 'loading'}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                >
                  {passwordStatus.type === 'loading' ? (
                    <span className="flex items-center justify-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Updating...
                    </span>
                  ) : (
                    'Update Password'
                  )}
                </button>
                {passwordStatus.type !== 'idle' && (
                  <div className={`p-2 rounded-lg text-xs ${
                    passwordStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                    passwordStatus.type === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {passwordStatus.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
