'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Calendar, User, MessageSquare, CheckCircle, Clock, XCircle,
  AlertCircle, Package, Send, Paperclip, Download, ImageIcon, Loader2,
  Lock, Sparkles,
} from 'lucide-react'
import { useMarkNotificationsRead } from '@/components/ui/UnreadBadge'
import { TicketShell } from '@/components/tickets/TicketShell'
import { TicketFileUpload, uploadTicketFiles } from '@/components/tickets/TicketFileUpload'
import { generateTicketId } from '@/utils/ticketId'

export default function TicketDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ticket, setTicket] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [replyFiles, setReplyFiles] = useState<File[]>([])
  const [replying, setReplying] = useState(false)
  const [closing, setClosing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const threadEndRef = useRef<HTMLDivElement>(null)

  const loadTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`)
      if (!res.ok) throw new Error('Not found')
      setTicket(await res.json())
      setLoading(false)
    } catch {
      setError('Ticket not found')
      setLoading(false)
    }
  }

  useEffect(() => { loadTicket() }, [id])
  useMarkNotificationsRead(`/dashboard/tickets/${id}`)

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.replies?.length])

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() && replyFiles.length === 0) return
    setReplying(true)
    try {
      if (replyText.trim()) {
        const res = await fetch(`/api/tickets/${id}/reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: replyText }),
        })
        if (!res.ok) throw new Error('Reply failed')
      }
      if (replyFiles.length > 0) {
        await uploadTicketFiles(id, replyFiles)
      }
      setReplyText('')
      setReplyFiles([])
      await loadTicket()
      toast.success('Reply sent')
    } catch {
      toast.error('Failed to send reply')
    } finally {
      setReplying(false)
    }
  }

  const closeTicket = async () => {
    if (!confirm('Close this ticket? You can still view it but won\'t be able to reply.')) return
    setClosing(true)
    try {
      const res = await fetch(`/api/tickets/${id}/close`, { method: 'PUT' })
      if (res.ok) {
        await loadTicket()
        toast.success('Ticket closed')
      } else {
        toast.error('Failed to close ticket')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setClosing(false)
    }
  }

  const handleQuickUpload = async (files: File[]) => {
    if (ticket?.status === 'closed') return
    setUploading(true)
    try {
      await uploadTicketFiles(id, files)
      await loadTicket()
      toast.success('File attached')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-gray-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading ticket...
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <TicketShell title="Ticket Not Found" subtitle="This ticket may have been removed.">
        <Link href="/dashboard/tickets" className="inline-flex items-center gap-2 text-violet-400 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to tickets
        </Link>
      </TicketShell>
    )
  }

  const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
    open: { icon: AlertCircle, color: 'text-rose-300', bg: 'bg-rose-500/15 border-rose-500/30', label: 'Open' },
    'in-progress': { icon: Clock, color: 'text-sky-300', bg: 'bg-sky-500/15 border-sky-500/30', label: 'In Progress' },
    resolved: { icon: CheckCircle, color: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-500/30', label: 'Resolved' },
    closed: { icon: XCircle, color: 'text-gray-400', bg: 'bg-white/5 border-white/10', label: 'Closed' },
  }
  const status = statusConfig[ticket.status] || statusConfig.open
  const StatusIcon = status.icon
  const ticketRef = generateTicketId(ticket.id)
  const isClosed = ticket.status === 'closed'

  return (
    <TicketShell
      title={ticket.subject}
      subtitle={`Ticket #${ticketRef} · ${status.label} · ${ticket.priority} priority`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/tickets"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            All tickets
          </Link>
          {!isClosed && (
            <button
              onClick={closeTicket}
              disabled={closing}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              {closing ? 'Closing...' : 'Close ticket'}
            </button>
          )}
        </div>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${status.bg} ${status.color}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </span>
        <span className="flex items-center gap-1 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          Opened {new Date(ticket.createdAt).toLocaleString()}
        </span>
        {ticket.orderId && (
          <Link
            href={`/dashboard/orders/${ticket.orderId}`}
            className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm text-violet-300 transition hover:bg-violet-500/20"
          >
            <Package className="h-3.5 w-3.5" />
            Order #{ticket.orderId.slice(0, 8)}
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Original message */}
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/30">
                <User className="h-4 w-4 text-violet-200" />
              </div>
              <div>
                <p className="text-sm font-medium">You</p>
                <p className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <p className="whitespace-pre-wrap text-gray-200">{ticket.message}</p>
          </div>

          {/* Replies */}
          {ticket.replies?.map((reply: any) => {
            const isStaff = reply.userId !== ticket.userId
            return (
              <div
                key={reply.id}
                className={`rounded-2xl border p-5 ${
                  isStaff
                    ? 'border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-sky-500/5'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isStaff ? 'bg-cyan-500/30' : 'bg-white/10'}`}>
                    <User className={`h-4 w-4 ${isStaff ? 'text-cyan-200' : 'text-gray-300'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {isStaff ? (
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-cyan-400" />
                          {reply.user?.username || 'Support Team'}
                        </span>
                      ) : 'You'}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-gray-200">{reply.message}</p>
              </div>
            )
          })}
          <div ref={threadEndRef} />

          {/* Reply form */}
          {!isClosed ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 flex items-center gap-2 font-bold">
                <MessageSquare className="h-5 w-5 text-violet-400" />
                Add a reply
              </h2>
              <form onSubmit={submitReply} className="space-y-4">
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  placeholder="Write your message..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  disabled={replying}
                />
                <TicketFileUpload files={replyFiles} onChange={setReplyFiles} disabled={replying} />
                <button
                  type="submit"
                  disabled={replying || (!replyText.trim() && replyFiles.length === 0)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-bold text-white transition hover:scale-[1.02] disabled:opacity-50"
                >
                  {replying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {replying ? 'Sending...' : 'Send Reply'}
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-gray-400">
              <Lock className="mx-auto mb-2 h-8 w-8" />
              This ticket is closed. Open a new ticket if you need more help.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-4 font-bold">Attachments</h3>
            {!ticket.attachments?.length ? (
              <p className="text-sm text-gray-500">No files attached yet.</p>
            ) : (
              <div className="space-y-3">
                {ticket.attachments.map((att: any) => {
                  const url = `/uploads/tickets/${att.filename}`
                  const isImage = att.mimeType?.startsWith('image/')
                  return (
                    <div key={att.id} className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
                      {isImage ? (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={att.originalName} className="max-h-40 w-full object-cover" />
                        </a>
                      ) : null}
                      <div className="flex items-center gap-2 p-3">
                        {isImage ? <ImageIcon className="h-4 w-4 text-violet-400" /> : <Paperclip className="h-4 w-4 text-cyan-400" />}
                        <span className="min-w-0 flex-1 truncate text-sm">{att.originalName}</span>
                        <a href={url} download className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!isClosed && (
              <div className="mt-4 border-t border-white/5 pt-4">
                <p className="mb-2 text-xs text-gray-500">Quick attach</p>
                <TicketFileUpload
                  files={[]}
                  onChange={files => files.length && handleQuickUpload(files)}
                  disabled={uploading}
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-3 font-bold">Conversation</h3>
            <p className="text-sm text-gray-400">
              {1 + (ticket.replies?.length || 0)} messages
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Priority: <span className="capitalize text-amber-400">{ticket.priority}</span>
            </p>
          </div>
        </div>
      </div>
    </TicketShell>
  )
}
