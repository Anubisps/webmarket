'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Box, ArrowUp, ArrowDown, HelpCircle, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface Faq {
  id: string
  question: string
  answer: string
  order: number
  isActive: boolean
}

export function FaqList({ initialFaqs }: { initialFaqs: Faq[] }) {
  const [faqs, setFaqs] = useState(initialFaqs)
  const [deleting, setDeleting] = useState<string | null>(null)

  const deleteFaq = async (id: string) => {
    if (!confirm('Delete this FAQ? This cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setFaqs(faqs.filter(f => f.id !== id))
        toast.success('FAQ deleted successfully')
      } else {
        toast.error('Failed to delete FAQ')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setDeleting(null)
    }
  }

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      const res = await fetch(`/api/admin/faq/${id}/order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder })
      })
      if (res.ok) {
        setFaqs(faqs.map(f => f.id === id ? { ...f, order: newOrder } : f).sort((a, b) => a.order - b.order))
        toast.success('Order updated')
      }
    } catch (err) {
      toast.error('Failed to update order')
    }
  }

  if (faqs.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-16 text-center">
        <HelpCircle className="w-20 h-20 text-gray-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">No FAQs yet</h3>
        <p className="text-gray-400">Create your first FAQ to help your customers.</p>
        <Link href="/accessadmin/faq/new" className="inline-flex items-center gap-2 px-6 py-3 mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all">
          <Plus className="w-4 h-4" />
          Add New FAQ
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/30">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Question</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Order</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {faqs.map((faq, index) => (
              <tr key={faq.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium line-clamp-1 max-w-md">
                  {faq.question}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    faq.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {faq.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{faq.order}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => updateOrder(faq.id, faq.order - 1)}
                        disabled={index === 0}
                        className="p-0.5 hover:text-purple-400 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateOrder(faq.id, faq.order + 1)}
                        disabled={index === faqs.length - 1}
                        className="p-0.5 hover:text-purple-400 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/accessadmin/faq/${faq.id}/edit`}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors text-blue-400"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      disabled={deleting === faq.id}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
