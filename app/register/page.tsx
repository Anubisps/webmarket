'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        setSuccess(true)
        setLoading(false)
        setTimeout(() => router.push('/login'), 1500)
      } else {
        const data = await res.json()
        setError(data.error || 'Registration failed')
        setLoading(false)
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Network error – please try again')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">Create Account</h1>
        {error && <p className="text-red-500 dark:text-red-400 text-center mb-4 font-medium">{error}</p>}
        {success && (
          <p className="text-green-500 dark:text-green-400 text-center mb-4 font-medium">
            ✅ Account created! Redirecting to login...
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Username</label>
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
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <span className="animate-spin">⟳</span> Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-700 dark:text-gray-300">
          Already have an account? <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">Login</Link>
        </p>
      </div>
    </div>
  )
}
