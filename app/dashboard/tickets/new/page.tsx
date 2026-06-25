'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AlertCircle, ArrowLeft, Loader2, Send, Sparkles } from 'lucide-react'
import { TicketShell } from '@/components/tickets/TicketShell'
import { TicketFileUpload, uploadTicketFiles } from '@/components/tickets/TicketFileUpload'

const CATEGORIES = [
  { value: 'Orders', label: 'Orders & Delivery' },
  { value: 'Payment', label: 'Payment Issues' },
  { value: 'Account', label: 'Account & Login' },
  { value: 'Product', label: 'Product Question' },
  { value: 'Refund', label: 'Refund Request' },
  { value: 'Other', label: 'Other' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low', desc: 'General question' },
  { value: 'medium', label: 'Medium', desc: 'Needs attention' },
  { value: 'high', label: 'High', desc: 'Blocking my purchase' },
  { value: 'urgent', label: 'Urgent', desc: 'Critical issue' },
]

function NewTicketForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get('orderId')
  const [linkedOrderId, setLinkedOrderId] = useState<string | null>(initialOrderId)
  const [form, setForm] = useState({ subject: '', message: '', category: 'Orders', priority: 'medium' })
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orderInfo, setOrderInfo] = useState<any>(null)
  const [userOrders, setUserOrders] = useState<{ id: string; total: number; status: string; items: { product: { name: string } }[] }[]>([])

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.orders) setUserOrders(data.orders)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!linkedOrderId) {
      setOrderInfo(null)
      return
    }
    setLoading(true)
    fetch(`/api/orders/${linkedOrderId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.id) {
          setOrderInfo(data)
          setForm(prev => ({
            ...prev,
            category: 'Orders',
            subject: prev.subject || `Issue with Order #${data.id.slice(0, 8)}`,
          }))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [linkedOrderId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Please fill in subject and message')
      return
    }
    setSubmitting(true)

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: form.subject.trim(),
          message: form.message.trim(),
          orderId: linkedOrderId || null,
          priority: form.priority,
          category: form.category,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'Ticket already exists for this order') {
          toast.error('A ticket already exists for this order')
          setTimeout(() => router.push('/dashboard/orders'), 1000)
        } else {
          toast.error(data.error || 'Failed to create ticket')
        }
        return
      }

      if (files.length > 0 && data.ticketId) {
        try {
          await uploadTicketFiles(data.ticketId, files)
        } catch {
          toast.error('Ticket created but some files failed to upload')
          router.push(`/dashboard/tickets/${data.ticketId}`)
          return
        }
      }

      toast.success('Ticket created successfully!')
      router.push(data.ticketId ? `/dashboard/tickets/${data.ticketId}` : '/dashboard/tickets')
    } catch {
      toast.error('Network error – please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <TicketShell
      title="New Support Ticket"
      subtitle="Tell us what you need — attach screenshots or files for faster help."
      actions={
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Link>
      }
    >
      {linkedOrderId && loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading order details...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">Link to order (optional)</label>
            <select
              value={linkedOrderId || ''}
              onChange={e => setLinkedOrderId(e.target.value || null)}
              disabled={submitting}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none"
            >
              <option value="" className="bg-gray-900">No order linked</option>
              {userOrders.map(o => (
                <option key={o.id} value={o.id} className="bg-gray-900">
                  #{o.id.slice(0, 8)} — {o.items[0]?.product?.name || 'Order'} (${o.total.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {linkedOrderId && orderInfo && (
            <div className="flex items-start gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
              <div>
                <p className="font-medium text-violet-200">Linked to order</p>
                <p className="text-sm text-gray-400">Order #{orderInfo.id.slice(0, 8)} — this ticket will be tied to your purchase.</p>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg md:p-8">
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  disabled={submitting}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      disabled={submitting}
                      onClick={() => setForm({ ...form, priority: p.value })}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                        form.priority === p.value
                          ? 'border-violet-500/50 bg-violet-500/20 text-white'
                          : 'border-white/10 bg-black/20 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span className="block font-medium">{p.label}</span>
                      <span className="text-xs opacity-70">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-300">Subject</label>
              <input
                type="text"
                required
                placeholder="Brief summary of your issue"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                disabled={submitting}
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-300">Message</label>
              <textarea
                required
                rows={6}
                placeholder="Describe your issue in detail. Include order numbers, error messages, or steps to reproduce."
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                disabled={submitting}
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-300">Attachments (optional)</label>
              <TicketFileUpload files={files} onChange={setFiles} disabled={submitting} />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 py-4 font-bold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating ticket...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Submit Ticket
                  <Sparkles className="h-4 w-4 opacity-80" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </TicketShell>
  )
}

export default function NewTicketPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-gray-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading...
      </div>
    }>
      <NewTicketForm />
    </Suspense>
  )
}
