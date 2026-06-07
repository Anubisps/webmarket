'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, Calendar, User, MessageSquare, CheckCircle, Clock, XCircle, AlertCircle, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TicketDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ticket, setTicket] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [closing, setClosing] = useState(false)

  const loadTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`)
      if (!res.ok) throw new Error('Ticket not found')
      const data = await res.json()
      setTicket(data)
      setLoading(false)
    } catch (err) {
      setError('Ticket not found')
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTicket()
  }, [id])

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setReplying(true)
    try {
      const res = await fetch(`/api/tickets/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText })
      })
      if (res.ok) {
        setReplyText('')
        await loadTicket()
        toast.success('Reply posted successfully')
      } else {
        toast.error('Failed to post reply')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setReplying(false)
    }
  }

  const closeTicket = async () => {
    if (!confirm('Are you sure you want to close this ticket?')) return
    setClosing(true)
    try {
      const res = await fetch(`/api/tickets/${id}/close`, {
        method: 'PUT'
      })
      if (res.ok) {
        await loadTicket()
        toast.success('Ticket closed')
      } else {
        toast.error('Failed to close ticket')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setClosing(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading ticket...</div>
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-500 mb-4">{error}</p>
      <Link href="/dashboard/tickets" className="text-purple-600 hover:underline">← Back to Tickets</Link>
    </div>
  )

  const statusConfig = {
    open: { icon: AlertCircle, color: 'text-red-600', label: 'Open' },
    'in-progress': { icon: Clock, color: 'text-blue-600', label: 'In Progress' },
    resolved: { icon: CheckCircle, color: 'text-green-600', label: 'Resolved' },
    closed: { icon: XCircle, color: 'text-gray-600', label: 'Closed' },
  }
  const StatusIcon = statusConfig[ticket.status as keyof typeof statusConfig]?.icon || Clock

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/dashboard/tickets" className="flex items-center text-purple-600 mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tickets
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{ticket.subject}</h1>
              <p className="text-sm opacity-80 mt-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 bg-white/20 ${statusConfig[ticket.status as keyof typeof statusConfig]?.color || 'text-gray-300'}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig[ticket.status as keyof typeof statusConfig]?.label || ticket.status}
              </span>
              {ticket.status !== 'closed' && (
                <button
                  onClick={closeTicket}
                  disabled={closing}
                  className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600 transition disabled:opacity-50"
                >
                  {closing ? 'Closing...' : 'Close'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Original message */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300">{ticket.message}</p>
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
              <User className="w-3 h-3" /> You on {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Order link if exists */}
          {ticket.orderId && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Related Order: <Link href={`/dashboard/orders/${ticket.orderId}`} className="underline font-medium">Order #{ticket.orderId.slice(0,8)}</Link>
              </p>
            </div>
          )}

          {/* Replies */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Replies ({ticket.replies?.length || 0})
            </h2>
            {!ticket.replies || ticket.replies.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No replies yet.</p>
            ) : (
              <div className="space-y-4">
                {ticket.replies.map((reply: any) => (
                  <div key={reply.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">{reply.message}</p>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {reply.user?.username || 'Staff'} on {new Date(reply.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reply form */}
          {ticket.status !== 'closed' && (
            <div>
              <h2 className="text-lg font-bold mb-4">Add Reply</h2>
              <form onSubmit={submitReply} className="space-y-4">
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={replying}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {replying ? 'Posting...' : 'Post Reply'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
