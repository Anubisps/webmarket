'use client'
import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, User, Lock, ArrowRight, CheckCircle, XCircle, Shield, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [form, setForm] = useState({ username: '', password: '', twoFactorToken: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [rememberedEmail, setRememberedEmail] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username: form.username,
        password: form.password,
        twoFactorToken: show2FA ? form.twoFactorToken : undefined
      })

      if (result?.error === '2FA_REQUIRED') {
        setShow2FA(true)
        setRememberedEmail(form.username)
        toast('2FA required – enter your authenticator code')
        setLoading(false)
        return
      }

      if (result?.error) {
        setError('Invalid username or password')
        setLoading(false)
      } else if (result?.ok) {
        toast.success('Login successful!')
        setTimeout(() => router.push('/dashboard'), 500)
      } else {
        setError('Login failed – unknown error')
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error – please try again')
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white py-20">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-pink-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
              <Shield className="w-3 h-3 text-purple-400" />
              <span className="text-xs font-medium text-gray-300">Welcome back</span>
            </div>
            <h1 className="text-3xl font-extrabold mb-2">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Login</span>
            </h1>
            <p className="text-gray-400 text-sm">Access your WindVault account.</p>
          </div>

          {error && <p className="text-red-400 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!show2FA ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400 flex items-center gap-2">
                    <User className="w-4 h-4" /> Username or Email
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your username or email"
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-400">
                  Enter the 6-digit code from your authenticator app for <strong className="text-white">{rememberedEmail}</strong>
                </p>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Authenticator Code
                  </label>
                  <input
                    type="text"
                    placeholder="123456"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    value={form.twoFactorToken}
                    onChange={e => setForm({ ...form, twoFactorToken: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShow2FA(false)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  ← Back to login
                </button>
              </>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : (show2FA ? 'Verify 2FA' : 'Login')} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
