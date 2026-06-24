'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Box, Trash2, Clock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'

interface TicketRow {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
  user: { username: string; email: string }
  replies: { id: string }[]
}

export function TicketsTable({ tickets }: { tickets: TicketRow[] }) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)

  const setStatus = async (id: string, status: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success(status === 'in-progress' ? 'Ticket marked in progress' : 'Ticket updated')
        router.refresh()
      } else {
        toast.error('Failed to update ticket')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setBusyId(null)
    }
  }

  const deleteTicket = async (id: string, subject: string) => {
    if (!confirm(`Delete ticket "${subject}" permanently? This cannot be undone.`)) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Ticket deleted')
        router.refresh()
      } else {
        toast.error('Failed to delete ticket')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setBusyId(null)
    }
  }

  if (tickets.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-gray-400">
        <Box className="w-12 h-12 mx-auto mb-3 text-gray-500" />
        <p>No tickets found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-black/30">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">ID</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Subject</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Priority</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Replies</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
            <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {tickets.map(ticket => (
            <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-mono text-sm">#{ticket.id.slice(0, 8)}</td>
              <td className="px-6 py-4 font-medium">{ticket.subject}</td>
              <td className="px-6 py-4">
                <p className="font-medium">{ticket.user.username}</p>
                <p className="text-xs text-gray-400">{ticket.user.email}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ticket.status === 'open' ? 'bg-red-500/20 text-red-400' :
                  ticket.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                  ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {ticket.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ticket.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {ticket.priority}
                </span>
              </td>
              <td className="px-6 py-4 text-center text-gray-400">{ticket.replies.length}</td>
              <td className="px-6 py-4 text-sm text-gray-400">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2 flex-wrap">
                  {ticket.status !== 'in-progress' && (
                    <button
                      onClick={() => setStatus(ticket.id, 'in-progress')}
                      disabled={busyId === ticket.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 transition-colors text-xs font-medium disabled:opacity-50"
                    >
                      {busyId === ticket.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                      In Progress
                    </button>
                  )}
                  <Link
                    href={`/accessadmin/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs"
                  >
                    Manage <ArrowRight className="w-3 h-3" />
                  </Link>
                  <button
                    onClick={() => deleteTicket(ticket.id, ticket.subject)}
                    disabled={busyId === ticket.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
