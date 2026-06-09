'use client'
import { useState, useEffect } from 'react'
import { Sparkles, Tag, Plus, Trash2, Clock, Box, Save, X, CheckCircle, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DiscountsPage() {
  const [codes, setCodes] = useState<any[]>([])
  const [form, setForm] = useState({ code: '', discount: '', expiresAt: '', usageLimit: '' })
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadCodes = async () => {
    const res = await fetch('/api/admin/settings/discounts')
    const data = await res.json()
    setCodes(data)
  }

  useEffect(() => {
    loadCodes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code || !form.discount) {
      toast.error('Code and discount are required')
      return
    }
    setLoading(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId 
        ? `/api/admin/settings/discounts/${editingId}`
        : '/api/admin/settings/discounts'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        toast.success(editingId ? '✅ Discount updated!' : '✅ Discount code created!')
        setForm({ code: '', discount: '', expiresAt: '', usageLimit: '' })
        setEditingId(null)
        loadCodes()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Operation failed')
      }
    } catch (err) {
      toast.error('Network error – please try again')
    } finally {
      setLoading(false)
    }
  }

  const deleteCode = async (id: string) => {
    if (!confirm('Delete this discount code?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/settings/discounts/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('✅ Discount deleted')
        loadCodes()
      } else {
        toast.error('Failed to delete discount')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setDeleting(null)
    }
  }

  const startEdit = (code: any) => {
    setForm({
      code: code.code,
      discount: code.discount.toString(),
      expiresAt: code.expiresAt ? new Date(code.expiresAt).toISOString().slice(0,16) : '',
      usageLimit: code.usageLimit?.toString() || ''
    })
    setEditingId(code.id)
  }

  const cancelEdit = () => {
    setForm({ code: '', discount: '', expiresAt: '', usageLimit: '' })
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Tag className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium text-gray-300">Discounts</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Discount</span> Codes
          </h1>
          <p className="text-gray-400 text-lg">Create and manage promotional codes.</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          {editingId ? <Edit2 className="w-5 h-5 text-blue-400" /> : <Plus className="w-5 h-5 text-yellow-400" />}
          {editingId ? 'Edit Discount' : 'Create New Discount'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Code (e.g., SAVE20)"
            className="px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
            disabled={!!editingId}
          />
          <input
            placeholder="Discount % (e.g., 20)"
            type="number"
            className="px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
            value={form.discount}
            onChange={e => setForm({ ...form, discount: e.target.value })}
          />
          <input
            placeholder="Expires (optional)"
            type="datetime-local"
            className="px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
            value={form.expiresAt}
            onChange={e => setForm({ ...form, expiresAt: e.target.value })}
          />
          <input
            placeholder="Usage limit (optional)"
            type="number"
            className="px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
            value={form.usageLimit}
            onChange={e => setForm({ ...form, usageLimit: e.target.value })}
          />
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : editingId ? 'Update Discount' : 'Create Discount'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="py-4 px-6 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Code</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Discount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Expires</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Usage</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Box className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p>No discount codes yet.</p>
                  </td>
                </tr>
              ) : (
                codes.map(code => (
                  <tr key={code.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-yellow-400">{code.code}</td>
                    <td className="px-6 py-4 text-emerald-400">{code.discount}%</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{code.usageCount || 0} / {code.usageLimit || '∞'}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(code)}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCode(code.id)}
                        disabled={deleting === code.id}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {deleting === code.id ? <Clock className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
