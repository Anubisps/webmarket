'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function ManageTicketPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [ticket, setTicket] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [staffList, setStaffList] = useState<any[]>([])
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    // Fetch ticket details
    fetch(`/api/admin/tickets/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Ticket not found')
        return res.json()
      })
      .then(data => {
        setTicket(data)
        setLoading(false)
      })
      .catch(err => {
        setError('Ticket not found')
        setLoading(false)
      })

    // Fetch staff list for dropdown
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
      const res = await fetch(`/api/admin/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setSuccess('Status updated successfully')
        const updated = await res.json()
        setTicket(updated)
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

  const updatePriority = async (priority: string) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/tickets/${id}/priority`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      })
      if (res.ok) {
        setSuccess('Priority updated successfully')
        const updated = await res.json()
        setTicket(updated)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update priority')
      }
    } catch (err) {
      setError('Network error – please try again')
    } finally {
      setLoading(false)
    }
  }

  const assignTicket = async (staffId: string) => {
    setAssigning(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/tickets/${id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: staffId || null })
      })
      if (res.ok) {
        setSuccess('Ticket assigned successfully')
        const updated = await res.json()
        setTicket(updated)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to assign ticket')
      }
    } catch (err) {
      setError('Network error – please try again')
    } finally {
      setAssigning(false)
    }
  }

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setReplying(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/tickets/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText })
      })
      if (res.ok) {
        setSuccess('Reply posted successfully')
        setReplyText('')
        const updated = await res.json()
        setTicket(updated)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to post reply')
      }
    } catch (err) {
      setError('Network error – please try again')
    } finally {
      setReplying(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading ticket...</div>
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-500 mb-4">{error}</p>
      <Link href="/accessadmin/tickets" className="text-purple-600 hover:underline">← Back to Tickets</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ticket #{ticket.id.slice(0,8)}</h1>
        <Link href="/accessadmin/tickets" className="text-purple-600 hover:underline">← Back to Tickets</Link>
      </div>

      {success && <p className="text-green-500 mb-4">{success}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Ticket Details */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold">{ticket.subject}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  ticket.status === 'open' ? 'bg-red-100 text-red-700' :
                  ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                  ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {ticket.status}
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-sm text-gray-500">
                <span>Priority: <strong>{ticket.priority}</strong></span>
                <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                <span>User: {ticket.user.username} ({ticket.user.email})</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed">{ticket.message}</p>
            </div>
          </div>

          {/* Replies */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Replies ({ticket.replies.length})</h2>
            {ticket.replies.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No replies yet.</p>
            ) : (
              <div className="space-y-4">
                {ticket.replies.map((reply: any) => (
                  <div key={reply.id} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{reply.message}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      — {reply.user?.username || 'Staff'} on {new Date(reply.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Form */}
            <form onSubmit={submitReply} className="mt-6">
              <textarea
                required
                rows={4}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Write your reply..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />
              <button
                type="submit"
                disabled={replying}
                className="mt-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {replying ? 'Posting...' : 'Post Reply'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="font-bold mb-3">Status</h3>
            <div className="flex flex-col gap-2">
              {['open', 'in-progress', 'resolved', 'closed'].map(status => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={loading || ticket.status === status}
                  className={`px-3 py-1 rounded text-sm ${
                    ticket.status === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="font-bold mb-3">Priority</h3>
            <div className="flex flex-col gap-2">
              {['low', 'medium', 'high'].map(priority => (
                <button
                  key={priority}
                  onClick={() => updatePriority(priority)}
                  disabled={loading || ticket.priority === priority}
                  className={`px-3 py-1 rounded text-sm ${
                    ticket.priority === priority
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="font-bold mb-3">Assigned To</h3>
            <select
              value={ticket.assignedTo || ''}
              onChange={e => assignTicket(e.target.value)}
              disabled={assigning}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Unassigned</option>
              {staffList.map((staff: any) => (
                <option key={staff.id} value={staff.id}>
                  {staff.username} ({staff.role})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="font-bold mb-3">Attachments</h3>
            {ticket.attachments?.length === 0 ? (
              <p className="text-sm text-gray-500">No attachments</p>
            ) : (
              <div className="space-y-1">
                {ticket.attachments?.map((att: any) => (
                  <div key={att.id} className="text-sm">
                    <a
                      href={`/uploads/tickets/${att.filename}`}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      📎 {att.originalName}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
