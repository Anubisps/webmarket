import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Ticket, MessageSquare, Plus, Clock, CheckCircle, AlertCircle, XCircle, Calendar, Box, ArrowRight } from 'lucide-react'
import { generateTicketId } from '@/utils/ticketId'

export default async function TicketsPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      tickets: {
        include: {
          order: {
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!user) redirect('/login')

  const statusConfig = {
    open: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Open' },
    'in-progress': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'In Progress' },
    resolved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Resolved' },
    closed: { icon: XCircle, color: 'text-gray-400', bg: 'bg-white/5', label: 'Closed' },
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white py-12">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        {/* ===== BACKGROUND AMBIENCE ===== */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-cyan-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
              Support <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Tickets</span>
            </h1>
            <p className="text-gray-400 text-lg">Manage your support requests.</p>
          </div>
          <Link href="/dashboard/tickets/new" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-105 transition-all mt-4 md:mt-0">
            <Plus className="w-4 h-4" />
            New Ticket
          </Link>
        </div>

        {/* ===== TICKETS LIST ===== */}
        {user.tickets.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-16 text-center">
            <MessageSquare className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No tickets yet</h3>
            <p className="text-gray-400">Need help? Create a ticket and our team will assist you.</p>
            <Link href="/dashboard/tickets/new" className="inline-flex items-center gap-2 px-6 py-3 mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-105 transition-all">
              Create Ticket <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.tickets.map(ticket => {
              const StatusIcon = statusConfig[ticket.status as keyof typeof statusConfig]?.icon || Clock
              const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || { color: 'text-gray-400', bg: 'bg-white/5', label: ticket.status }
              const ticketId = generateTicketId(ticket.id)
              return (
                <Link
                  key={ticket.id}
                  href={`/dashboard/tickets/${ticket.id}`}
                  className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{ticket.subject}</h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">#{ticketId}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.bg} ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {ticket.message}
                    </p>
                    {ticket.order && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <span className="text-xs text-gray-500">Order: #{ticket.order.id.slice(0,8)}</span>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-end gap-1 text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      View Ticket <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
