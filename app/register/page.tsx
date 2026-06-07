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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-4">
            ✅ Account created! Redirecting to login...
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
        <p className="text-center mt-4">
          Already have an account? <Link href="/login" className="text-purple-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
