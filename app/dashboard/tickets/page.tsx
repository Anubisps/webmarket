import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, XCircle, Calendar, ArrowRight, Sparkles } from 'lucide-react'
import { generateTicketId } from '@/utils/ticketId'
import { TicketShell } from '@/components/tickets/TicketShell'

export default async function TicketsPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      tickets: {
        include: { order: { select: { id: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) redirect('/login')

  const statusConfig = {
    open: { icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', label: 'Open' },
    'in-progress': { icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', label: 'In Progress' },
    resolved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Resolved' },
    closed: { icon: XCircle, color: 'text-gray-400', bg: 'bg-white/5 border-white/10', label: 'Closed' },
  }

  const priorityColors: Record<string, string> = {
    low: 'text-gray-400',
    medium: 'text-amber-400',
    high: 'text-orange-400',
    urgent: 'text-rose-400',
  }

  const openCount = user.tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length

  return (
    <TicketShell
      title="Support Center"
      subtitle="Track requests, attach files, and chat with our team."
      actions={
        <Link
          href="/dashboard/tickets/new"
          className="relative z-20 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02] hover:shadow-violet-500/40"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </Link>
      }
    >
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
          <p className="mt-1 text-2xl font-bold">{user.tickets.length}</p>
        </div>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-rose-300/70">Active</p>
          <p className="mt-1 text-2xl font-bold text-rose-300">{openCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-300/70">Resolved</p>
          <p className="mt-1 text-2xl font-bold text-emerald-300">
            {user.tickets.filter(t => t.status === 'resolved').length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Closed</p>
          <p className="mt-1 text-2xl font-bold">
            {user.tickets.filter(t => t.status === 'closed').length}
          </p>
        </div>
      </div>

      {user.tickets.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-16 text-center backdrop-blur-lg">
          <MessageSquare className="mx-auto mb-4 h-20 w-20 text-gray-600" />
          <h3 className="mb-2 text-2xl font-bold">No tickets yet</h3>
          <p className="mx-auto mb-6 max-w-md text-gray-400">
            Need help with an order or account? Open a ticket and attach screenshots so we can help faster.
          </p>
          <Link
            href="/dashboard/tickets/new"
            className="relative z-20 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-bold text-white transition hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            Create Your First Ticket
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {user.tickets.map(ticket => {
            const StatusIcon = statusConfig[ticket.status as keyof typeof statusConfig]?.icon || Clock
            const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || {
              color: 'text-gray-400',
              bg: 'bg-white/5 border-white/10',
              label: ticket.status,
            }
            const ticketId = generateTicketId(ticket.id)
            return (
              <Link
                key={ticket.id}
                href={`/dashboard/tickets/${ticket.id}`}
                className="group relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 backdrop-blur-lg transition hover:border-violet-500/30 hover:shadow-[0_0_40px_rgba(139,92,246,0.12)]"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-fuchsia-500/15" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-lg transition group-hover:text-violet-300">
                      {ticket.subject}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(ticket.createdAt).toLocaleDateString()} · #{ticketId}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium flex items-center gap-1 ${statusInfo.bg} ${statusInfo.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusInfo.label}
                  </span>
                </div>
                <p className="relative mt-3 line-clamp-2 text-sm text-gray-400">{ticket.message}</p>
                <div className="relative mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className={`text-xs font-medium capitalize ${priorityColors[ticket.priority] || 'text-gray-400'}`}>
                    {ticket.priority} priority
                  </span>
                  <span className="flex items-center gap-1 text-sm font-medium text-violet-400 transition group-hover:translate-x-1">
                    Open ticket <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </TicketShell>
  )
}
