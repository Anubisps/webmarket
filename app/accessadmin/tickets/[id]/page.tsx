'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle, User, Package, Sparkles, MessageSquare, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

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

  if (loading) return <div className="p-8 text-center text-gray-400">Loading ticket...</div>
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-400 mb-4">{error}</p>
      <Link href="/accessadmin/tickets" className="text-purple-400 hover:underline">← Back to Tickets</Link>
    </div>
  )

  const statusConfig = {
    open: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Open' },
    'in-progress': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'In Progress' },
    resolved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Resolved' },
    closed: { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Closed' },
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-gray-300">Ticket</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Ticket #{ticket.id.slice(0,8)}
          </h1>
          <p className="text-gray-400 text-lg">Manage ticket details and replies.</p>
        </div>
        <Link
          href="/accessadmin/tickets"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all mt-4 md:mt-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
      </div>

      {/* ===== ALERTS ===== */}
      {success && <p className="text-emerald-400 mb-4">{success}</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* ===== MAIN CONTENT ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column - Ticket Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{ticket.subject}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[ticket.status as keyof typeof statusConfig]?.bg || 'bg-gray-500/20'} ${statusConfig[ticket.status as keyof typeof statusConfig]?.color || 'text-gray-400'}`}>
                <Clock className="w-3 h-3" />
                {statusConfig[ticket.status as keyof typeof statusConfig]?.label || ticket.status}
              </span>
            </div>
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-300">{ticket.message}</p>
              <p className="text-sm text-gray-400 mt-2">
                — {ticket.user.username} ({ticket.user.email}) on {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>
            {ticket.orderId && (
              <div className="mt-4 bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                <p className="text-sm text-blue-400 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Related Order: #{ticket.orderId.slice(0,8)}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Replies ({ticket.replies?.length || 0})
            </h2>
            {!ticket.replies || ticket.replies.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No replies yet.</p>
            ) : (
              <div className="space-y-4">
                {ticket.replies.map((reply: any) => (
                  <div key={reply.id} className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <p className="text-gray-300">{reply.message}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      — {reply.user?.username || 'Staff'} on {new Date(reply.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={submitReply} className="mt-4">
              <textarea
                required
                rows={3}
                placeholder="Write your reply..."
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />
              <button
                type="submit"
                disabled={replying}
                className="mt-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {replying ? 'Posting...' : 'Post Reply'}
              </button>
            </form>
          </div>
        </div>

        {/* Right column - Controls */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
            <h3 className="font-bold mb-3 text-gray-200">Status</h3>
            <div className="flex flex-col gap-2">
              {['open', 'in-progress', 'resolved', 'closed'].map(status => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={loading || ticket.status === status}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${
                    ticket.status === status
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
            <h3 className="font-bold mb-3 text-gray-200">Priority</h3>
            <div className="flex flex-col gap-2">
              {['low', 'medium', 'high'].map(priority => (
                <button
                  key={priority}
                  onClick={() => updatePriority(priority)}
                  disabled={loading || ticket.priority === priority}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${
                    ticket.priority === priority
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
            <h3 className="font-bold mb-3 text-gray-200">Assigned To</h3>
            <select
              value={ticket.assignedTo || ''}
              onChange={e => assignTicket(e.target.value)}
              disabled={assigning}
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            >
              <option value="">Unassigned</option>
              {staffList.map((staff: any) => (
                <option key={staff.id} value={staff.id}>
                  {staff.username} ({staff.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
