'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle, Box, User, Mail, CreditCard, Package, Sparkles, Edit, Save, Trash2, Plus, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface OrderItem {
  id: string
  productId: string
  productName: string
  price: number
  quantity: number
}

export default function ManageOrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [staffList, setStaffList] = useState<any[]>([])
  const [editing, setEditing] = useState(false)
  const [staffNote, setStaffNote] = useState('')
  const [discountAmount, setDiscountAmount] = useState('')
  const [items, setItems] = useState<OrderItem[]>([])
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Order not found')
        return res.json()
      })
      .then(data => {
        setOrder(data)
        setStaffNote(data.staffNote || '')
        setDiscountAmount(data.discountAmount?.toString() || '')
        setItems(data.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          price: item.price,
          quantity: item.quantity
        })))
        setLoading(false)
      })
      .catch(err => {
        setError('Order not found')
        setLoading(false)
      })

    fetch('/api/admin/users/staff')
      .then(res => res.json())
      .then(data => setStaffList(data))
      .catch(err => console.error('Failed to load staff:', err))
  }, [id])

  const updateStatus = async (status: string) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setSuccess('Status updated successfully')
        const updated = await res.json()
        setOrder(updated)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update status')
      }
    } catch (err) {
      setError('Network error – please try again')
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentStatus = async (paymentStatus: string) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/orders/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus })
      })
      if (res.ok) {
        setSuccess('Payment status updated successfully')
        const updated = await res.json()
        setOrder(updated)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update payment status')
      }
    } catch (err) {
      setError('Network error – please try again')
    } finally {
      setLoading(false)
    }
  }

  const saveOrderDetails = async () => {
    setUpdating(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/orders/${id}/details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffNote: staffNote.trim(),
          discountAmount: parseFloat(discountAmount) || 0,
          items: items.map(item => ({
            id: item.id,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity
          }))
        })
      })
      if (res.ok) {
        setSuccess('Order details updated successfully')
        const updated = await res.json()
        setOrder(updated)
        setEditing(false)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update order')
      }
    } catch (err) {
      setError('Network error – please try again')
    } finally {
      setUpdating(false)
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { id: 'new_' + Date.now(), productId: '', productName: '', price: 0, quantity: 1 }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('Order must have at least one item')
      return
    }
    setItems(items.filter((_, i) => i !== index))
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading order...</div>
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-400 mb-4">{error}</p>
      <Link href="/accessadmin/orders" className="text-purple-400 hover:underline">← Back to Orders</Link>
    </div>
  )

  const statusConfig = {
    processing: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Processing' },
    completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' },
    cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Cancelled' },
    disputed: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Disputed' },
  }

  const paymentStatusConfig = {
    pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending Payment' },
    paid: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Paid' },
    failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
    refunded: { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Refunded' },
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const finalTotal = total - (parseFloat(discountAmount) || 0)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Box className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-gray-300">Order</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Manage Order #{order.id.slice(0,8)}
          </h1>
          <p className="text-gray-400 text-lg">Update order status, details, and items.</p>
        </div>
        <Link
          href="/accessadmin/orders"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all mt-4 md:mt-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>

      {success && <p className="text-emerald-400 mb-4">{success}</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Box className="w-5 h-5 text-emerald-400" />
              Order Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4" /> Customer
                </p>
                <p className="font-medium">{order.user?.username}</p>
                <p className="text-xs text-gray-400">{order.user?.email}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4" /> Game ID / IGN
                </p>
                <p className="font-medium font-mono">{order.ign || 'Not provided'}</p>
                {order.ignUsername && (
                  <p className="text-sm text-emerald-400 mt-1">Username: {order.ignUsername}</p>
                )}
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Contact Email
                </p>
                <p className="font-medium">{order.contactEmail || 'Not provided'}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {finalTotal.toFixed(2)} USDC
                </p>
                {parseFloat(discountAmount) > 0 && (
                  <p className="text-xs text-green-400">Discount: -{discountAmount} USDC</p>
                )}
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Created
                </p>
                <p className="text-sm">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-400">Items</p>
                <p className="text-sm">{items.length} item(s)</p>
              </div>
            </div>
            <div className="mt-4 bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Staff Note (visible to user)
              </p>
              {editing ? (
                <textarea
                  value={staffNote}
                  onChange={(e) => setStaffNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white mt-1"
                  rows={2}
                  placeholder="Add a note for the customer..."
                />
              ) : (
                <p className="text-gray-300">{staffNote || 'No note'}</p>
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                Items
              </h2>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 rounded-xl bg-white/10 text-sm hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {editing ? 'Cancel Edit' : 'Edit Items'}
              </button>
            </div>
            {editing ? (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="bg-black/30 rounded-xl p-3 border border-white/5 flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) => updateItem(index, 'productName', e.target.value)}
                      className="flex-1 min-w-[120px] px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white"
                      placeholder="Product name"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                      className="w-24 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white"
                      placeholder="Price"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                      className="w-20 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white"
                      placeholder="Qty"
                    />
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
                <div className="mt-4 flex items-center gap-2">
                  <label className="text-sm text-gray-400">Discount Amount (USDC):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="w-32 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white"
                  />
                </div>
                <button
                  onClick={saveOrderDetails}
                  disabled={updating}
                  className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-sm text-gray-400">{item.price.toFixed(2)} USDC × {item.quantity}</span>
                  </div>
                ))}
                {parseFloat(discountAmount) > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-white/5">
                    <span className="text-green-400">Discount</span>
                    <span className="text-green-400">-{discountAmount} USDC</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
            <h3 className="font-bold mb-3 text-gray-200">Status</h3>
            <div className="flex flex-col gap-2">
              {['processing', 'completed', 'cancelled', 'disputed'].map(status => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={loading || order.status === status}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${
                    order.status === status
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
            <h3 className="font-bold mb-3 text-gray-200">Payment Status</h3>
            <div className="flex flex-col gap-2">
              {['pending', 'paid', 'failed'].map(status => (
                <button
                  key={status}
                  onClick={() => updatePaymentStatus(status)}
                  disabled={loading || order.paymentStatus === status}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${
                    order.paymentStatus === status
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
