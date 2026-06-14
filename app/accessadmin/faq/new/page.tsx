'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, HelpCircle, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewFaqPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    question: '',
    answer: '',
    isActive: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        toast.success('FAQ created successfully')
        router.push('/accessadmin/faq')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create FAQ')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300">FAQ Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Add <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">New FAQ</span>
          </h1>
          <p className="text-gray-400 text-lg">Create a frequently asked question.</p>
        </div>
        <Link
          href="/accessadmin/faq"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all mt-4 md:mt-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to FAQs
        </Link>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Question</label>
            <textarea
              rows={2}
              required
              placeholder="e.g., How do I purchase an item?"
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              value={form.question}
              onChange={e => setForm({ ...form, question: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Answer</label>
            <textarea
              rows={6}
              required
              placeholder="Provide a detailed answer..."
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              value={form.answer}
              onChange={e => setForm({ ...form, answer: e.target.value })}
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-purple-500"
              />
              Active (visible on website)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create FAQ'}
          </button>
        </form>
      </div>
    </div>
  )
}
