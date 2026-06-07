'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function DiscountsPage() {
  const [codes, setCodes] = useState<any[]>([])
  const [form, setForm] = useState({ code: '', discount: '', expiresAt: '', usageLimit: '' })
  const [loading, setLoading] = useState(false)
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
      const res = await fetch('/api/admin/settings/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        toast.success('✅ Discount code created!')
        setForm({ code: '', discount: '', expiresAt: '', usageLimit: '' })
        loadCodes()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create discount')
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Discount Codes</h1>
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Create New Discount</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Code (e.g., SAVE20)"
            className="px-4 py-2 border rounded-lg"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
          />
          <input
            placeholder="Discount % (e.g., 20)"
            type="number"
            className="px-4 py-2 border rounded-lg"
            value={form.discount}
            onChange={e => setForm({ ...form, discount: e.target.value })}
          />
          <input
            placeholder="Expires (optional)"
            type="datetime-local"
            className="px-4 py-2 border rounded-lg"
            value={form.expiresAt}
            onChange={e => setForm({ ...form, expiresAt: e.target.value })}
          />
          <input
            placeholder="Usage limit (optional)"
            type="number"
            className="px-4 py-2 border rounded-lg"
            value={form.usageLimit}
            onChange={e => setForm({ ...form, usageLimit: e.target.value })}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 col-span-1 md:col-span-2"
          >
            {loading ? 'Creating...' : 'Create Discount'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Discount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Expires</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Usage</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-center text-gray-500" colSpan={5}>
                  No discount codes yet.
                </td>
              </tr>
            ) : (
              codes.map(code => (
                <tr key={code.id}>
                  <td className="px-6 py-4 font-medium">{code.code}</td>
                  <td className="px-6 py-4">{code.discount}%</td>
                  <td className="px-6 py-4 text-sm">{code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'Never'}</td>
                  <td className="px-6 py-4 text-sm">{code.usageCount || 0} / {code.usageLimit || '∞'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteCode(code.id)}
                      disabled={deleting === code.id}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deleting === code.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
