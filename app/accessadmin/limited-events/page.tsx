'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLimitedEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    productId: '',
    discount: '',
    startDate: '',
    endDate: '',
    isActive: true
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/limited-events').then(res => res.json()),
      fetch('/api/admin/products').then(res => res.json())
    ]).then(([eventsData, productsData]) => {
      setEvents(eventsData)
      setProducts(productsData)
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load data:', err)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingId ? `/api/admin/limited-events/${editingId}` : '/api/admin/limited-events'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      toast.success(editingId ? 'Event updated' : 'Event created')
      setForm({ productId: '', discount: '', startDate: '', endDate: '', isActive: true })
      setEditingId(null)
      const updated = await fetch('/api/admin/limited-events').then(res => res.json())
      setEvents(updated)
    } else {
      toast.error('Failed to save event')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this limited event?')) return
    const res = await fetch(`/api/admin/limited-events/${id}`, {
      method: 'DELETE'
    })
    if (res.ok) {
      toast.success('Event deleted')
      const updated = await fetch('/api/admin/limited-events').then(res => res.json())
      setEvents(updated)
    } else {
      toast.error('Failed to delete event')
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold">Limited Time Events</h1>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-bold mb-3">
            {editingId ? 'Edit Event' : 'Add New Event'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Product</label>
              <select
                required
                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
                value={form.productId}
                onChange={e => setForm({ ...form, productId: e.target.value })}
              >
                <option value="">Select a product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
                value={form.discount}
                onChange={e => setForm({ ...form, discount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Start Date</label>
              <input
                type="datetime-local"
                required
                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">End Date</label>
              <input
                type="datetime-local"
                required
                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-purple-500"
              />
              <label className="text-sm text-gray-400">Active</label>
            </div>
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setForm({ productId: '', discount: '', startDate: '', endDate: '', isActive: true }) }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Discount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Start</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">End</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No events yet.
                  </td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">{event.product.name}</td>
                    <td className="px-4 py-3 text-emerald-400">{event.discount}%</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(event.startDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(event.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {event.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(event.id)
                          setForm({
                            productId: event.productId,
                            discount: event.discount.toString(),
                            startDate: event.startDate.slice(0, 16),
                            endDate: event.endDate.slice(0, 16),
                            isActive: event.isActive
                          })
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-blue-400"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
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
