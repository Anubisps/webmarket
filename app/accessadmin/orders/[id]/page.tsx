'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function ManageOrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Order not found')
        }
        return res.json()
      })
      .then(data => {
        setOrder(data)
        setLoading(false)
      })
      .catch(err => {
        setError('Order not found – it may have been deleted.')
        setLoading(false)
      })
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

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading order...</div>
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/accessadmin/orders" className="text-purple-600 hover:underline">
          ← Back to Orders
        </Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Order not found.</p>
        <Link href="/accessadmin/orders" className="text-purple-600 hover:underline">
          ← Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Order #{order.id.slice(0,8)}</h1>
        <Link href="/accessadmin/orders" className="text-purple-600 hover:underline">← Back to Orders</Link>
      </div>

      {success && <p className="text-green-500 mb-4">{success}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Order Information</h2>
          <div className="space-y-2">
            <p><strong>Customer:</strong> {order.user?.username} ({order.user?.email})</p>
            <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
            <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Items:</strong> {order.items?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Update Status</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Order Status</label>
              <div className="flex gap-2 flex-wrap">
                {['processing', 'completed', 'cancelled', 'disputed'].map(status => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={loading || order.status === status}
                    className={`px-3 py-1 rounded text-sm ${
                      order.status === status
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Status</label>
              <div className="flex gap-2 flex-wrap">
                {['pending', 'paid', 'failed'].map(status => (
                  <button
                    key={status}
                    onClick={() => updatePaymentStatus(status)}
                    disabled={loading || order.paymentStatus === status}
                    className={`px-3 py-1 rounded text-sm ${
                      order.paymentStatus === status
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
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
    </div>
  )
}
