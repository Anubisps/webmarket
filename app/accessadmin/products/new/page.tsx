'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    isActive: true,
    isLimited: false,
    discount: '',
    startDate: '',
    endDate: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
          discount: form.discount ? parseFloat(form.discount) : null,
          startDate: form.startDate ? new Date(form.startDate) : null,
          endDate: form.endDate ? new Date(form.endDate) : null
        })
      })

      if (res.ok) {
        router.push('/accessadmin/products')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create product')
      }
    } catch (err) {
      setError('Network error – please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <Link href="/accessadmin/products" className="text-purple-600 hover:underline">← Back to Products</Link>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border rounded-lg"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-2 border rounded-lg"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                required
                className="w-full px-4 py-2 border rounded-lg"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isLimited}
                onChange={e => setForm({ ...form, isLimited: e.target.checked })}
              />
              Limited Time
            </label>
          </div>
          {form.isLimited && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full px-4 py-2 border rounded-lg"
              value={form.discount}
              onChange={e => setForm({ ...form, discount: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  )
}
