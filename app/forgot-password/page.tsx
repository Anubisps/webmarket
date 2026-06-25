'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, CheckCircle, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { status } = useSession()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard/security')
    }
  }, [status, router])

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-gray-400">
        Loading...
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitted(true)
        toast.success('Reset link sent!')
      } else {
        toast.error(data.error || 'Something went wrong')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] py-20 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-30%] left-[-20%] h-[70%] w-[70%] rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute bottom-[-30%] right-[-20%] h-[70%] w-[70%] rounded-full bg-pink-600/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-md px-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
          <div className="mb-6 text-center">
            <h1 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent">
              Forgot Password
            </h1>
            <p className="mt-2 text-sm text-gray-400">We&apos;ll email you a reset link</p>
          </div>

          {submitted ? (
            <div className="space-y-4 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
              <p className="text-gray-300">If an account exists for that email, a reset link has been sent.</p>
              <Link href="/login" className="inline-block text-purple-400 hover:underline">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-bold transition hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link href="/login" className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </form>
          )}

          <p className="mt-6 flex items-start gap-2 rounded-xl border border-white/5 bg-black/20 p-3 text-xs text-gray-500">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
            Already logged in? Change your password from Dashboard → Security instead.
          </p>
        </div>
      </div>
    </div>
  )
}
