'use client'
import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          {show2FA ? 'Two-Factor Authentication' : 'Login'}
        </h1>
        {error && <p className="text-red-500 dark:text-red-400 text-center mb-4 font-medium">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!show2FA ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Username or Email</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  disabled={loading}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Enter the 6-digit code from your authenticator app for <strong className="text-gray-900 dark:text-white">{rememberedEmail}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Authenticator Code</label>
                <input
                  type="text"
                  placeholder="123456"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={form.twoFactorToken}
                  onChange={e => setForm({ ...form, twoFactorToken: e.target.value })}
                  disabled={loading}
                />
              </div>
              <button
                type="button"
                onClick={() => setShow2FA(false)}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline"
              >
                ← Back to login
              </button>
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white py-2 rounded-lg transition disabled:opacity-50 font-medium"
          >
            {loading ? 'Processing...' : show2FA ? 'Verify 2FA' : 'Login'}
          </button>
        </form>
        {!show2FA && (
          <p className="text-center mt-4 text-gray-700 dark:text-gray-300">
            Don't have an account? <Link href="/register" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">Register</Link>
          </p>
        )}
      </div>
    </div>
  )
}
