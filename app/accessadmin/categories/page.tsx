'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    enableUsernameFetch: false,
    fetchProvider: 'wherewindsmeet',
    gameIdLabel: 'In-Game ID',
  })
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

  const resetForm = () => {
    setForm({
      name: '',
      slug: '',
      enableUsernameFetch: false,
      fetchProvider: 'wherewindsmeet',
      gameIdLabel: 'In-Game ID',
    })
    setEditingId(null)
  }

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
      resetForm()
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
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-bold mb-3">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="ID field label"
                className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
                value={form.gameIdLabel}
                onChange={e => setForm({ ...form, gameIdLabel: e.target.value })}
              />
              <select
                className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
                value={form.fetchProvider}
                onChange={e => setForm({ ...form, fetchProvider: e.target.value })}
                disabled={!form.enableUsernameFetch}
              >
                <option value="wherewindsmeet">Where Winds Meet</option>
              </select>
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm">
                <input
                  type="checkbox"
                  checked={form.enableUsernameFetch}
                  onChange={e => setForm({ ...form, enableUsernameFetch: e.target.checked })}
                  className="accent-purple-500"
                />
                Enable username fetch
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition">
                {editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Username Fetch</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No categories yet.
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-400">{cat.slug}</td>
                    <td className="px-4 py-3">
                      {cat.enableUsernameFetch ? (
                        <span className="text-emerald-400 text-sm">On ({cat.fetchProvider || 'wherewindsmeet'})</span>
                      ) : (
                        <span className="text-gray-500 text-sm">Off</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(cat.id)
                          setForm({
                            name: cat.name,
                            slug: cat.slug,
                            enableUsernameFetch: !!cat.enableUsernameFetch,
                            fetchProvider: cat.fetchProvider || 'wherewindsmeet',
                            gameIdLabel: cat.gameIdLabel || 'In-Game ID',
                          })
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
