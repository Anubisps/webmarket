'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle, Clock, CheckCircle, XCircle, Search, ArrowRight, Trash2,
  Loader2, MessageSquare, User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { generateTicketId } from '@/utils/ticketId'
import { slaStatus } from '@/lib/tickets/sla'

type TicketRow = {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
  slaDueAt?: string | null
  user: { username: string; email: string }
  replies: { id: string }[]
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' },
] as const

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  open: { icon: AlertCircle, color: 'text-rose-300', bg: 'bg-rose-500/15 border-rose-500/30' },
  'in-progress': { icon: Clock, color: 'text-sky-300', bg: 'bg-sky-500/15 border-sky-500/30' },
  resolved: { icon: CheckCircle, color: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  closed: { icon: XCircle, color: 'text-gray-400', bg: 'bg-white/5 border-white/10' },
}

export function AdminTicketsBoard({ tickets }: { tickets: TicketRow[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      if (tab !== 'all' && t.status !== tab) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        t.subject.toLowerCase().includes(q) ||
        t.user.username.toLowerCase().includes(q) ||
        t.user.email.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      )
    })
  }, [tickets, tab, search])

  const counts = useMemo(() => ({
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    'in-progress': tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  }), [tickets])

  const setStatus = async (id: string, status: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success('Ticket updated')
        router.refresh()
      } else toast.error('Update failed')
    } finally {
      setBusyId(null)
    }
  }

  const deleteTicket = async (id: string, subject: string) => {
    if (!confirm(`Delete "${subject}"?`)) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Deleted')
        router.refresh()
      } else toast.error('Delete failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20'
                  : 'border border-white/10 bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs opacity-70">({counts[t.id as keyof typeof counts]})</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none md:w-72"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-16 text-center text-gray-400">
          <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-50" />
          No tickets in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map(ticket => {
            const st = statusConfig[ticket.status] || statusConfig.open
            const StatusIcon = st.icon
            return (
              <div
                key={ticket.id}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-lg transition hover:border-violet-500/30"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">#{generateTicketId(ticket.id)}</p>
                    <h3 className="truncate font-bold text-lg group-hover:text-violet-300">{ticket.subject}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      {ticket.user.username} · {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium flex items-center gap-1 ${st.bg} ${st.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {ticket.status}
                  </span>
                </div>

                <div className="mb-4 flex flex-wrap gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 capitalize ${
                    ticket.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300' :
                    ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                    ticket.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {ticket.priority} priority
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-gray-400">
                    {ticket.replies.length} replies
                  </span>
                  {ticket.slaDueAt && (
                    <span className={`rounded-full px-2 py-0.5 ${
                      slaStatus(new Date(ticket.slaDueAt)) === 'breached' ? 'bg-rose-500/20 text-rose-300' :
                      slaStatus(new Date(ticket.slaDueAt)) === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      SLA {new Date(ticket.slaDueAt).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {ticket.status === 'open' && (
                    <button
                      onClick={() => setStatus(ticket.id, 'in-progress')}
                      disabled={busyId === ticket.id}
                      className="rounded-lg bg-sky-500/15 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/25 disabled:opacity-50"
                    >
                      {busyId === ticket.id ? <Loader2 className="h-3 w-3 animate-spin inline" /> : null}
                      Start
                    </button>
                  )}
                  <Link
                    href={`/accessadmin/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/25"
                  >
                    Manage <ArrowRight className="h-3 w-3" />
                  </Link>
                  <button
                    onClick={() => deleteTicket(ticket.id, ticket.subject)}
                    disabled={busyId === ticket.id}
                    className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3 inline" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
