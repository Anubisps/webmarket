'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', slug: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  const loadCategories = async () => {
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.slug) {
      toast.error('Name and slug are required')
      return
    }

    const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      toast.success(editingId ? 'Category updated' : 'Category created')
      setForm({ name: '', slug: '' })
      setEditingId(null)
      loadCategories()
    } else {
      toast.error('Failed to save category')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE'
    })
    if (res.ok) {
      toast.success('Category deleted')
      loadCategories()
    } else {
      toast.error('Failed to delete category')
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-bold mb-3">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              placeholder="Name (e.g. Where Winds Meet)"
              className="flex-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Slug (e.g. where-winds-meet)"
              className="flex-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
            />
            <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition">
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setForm({ name: '', slug: '' }) }}
                className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Slug</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                    No categories yet.
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-400">{cat.slug}</td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(cat.id)
                          setForm({ name: cat.name, slug: cat.slug })
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-blue-400"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
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
