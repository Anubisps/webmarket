'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function NewTicketPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [form, setForm] = useState({ subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderInfo, setOrderInfo] = useState<any>(null)

  // Load order info if orderId is provided
  useEffect(() => {
    if (orderId) {
      setLoading(true)
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setOrderInfo(data)
            setForm(prev => ({
              ...prev,
              subject: `Issue with Order #${data.id.slice(0,8)}`
            }))
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [orderId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: form.subject.trim(),
          message: form.message.trim(),
          orderId: orderId || null
        })
      })

      if (res.ok) {
        toast.success('✅ Ticket created successfully!')
        router.push('/dashboard/tickets')
      } else {
        const data = await res.json()
        if (data.error === 'Ticket already exists for this order') {
          toast.error('A ticket already exists for this order')
          setTimeout(() => router.push('/dashboard/orders'), 1000)
        } else {
          toast.error(data.error || 'Failed to create ticket')
        }
      }
    } catch (err) {
      toast.error('Network error – please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Link href="/dashboard/tickets" className="flex items-center text-purple-600 mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tickets
      </Link>

      <h1 className="text-3xl font-bold mb-6">Create New Ticket</h1>

      {orderId && loading ? (
        <div className="text-center py-8 text-gray-500">Loading order details...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {orderId && orderInfo && (
            <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Creating ticket for Order #{orderInfo.id.slice(0,8)}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="Brief description of the issue"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                required
                rows={5}
                placeholder="Describe your issue in detail"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:scale-[1.02] transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
