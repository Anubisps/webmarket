import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Ticket, Sparkles, Box, ArrowRight, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

export default async function AdminTickets() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || !['admin', 'manager', 'support'].includes(user.role)) {
    redirect('/dashboard')
  }

  const tickets = await prisma.ticket.findMany({
    include: {
      user: {
        select: { username: true, email: true }
      },
      replies: {
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Ticket className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-gray-300">Tickets</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Support <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Tickets</span>
          </h1>
          <p className="text-gray-400 text-lg">Manage customer support requests.</p>
        </div>
      </div>

      {/* ===== TICKETS TABLE ===== */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
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
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <Box className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p>No tickets found</p>
                  </td>
                </tr>
              ) : (
                tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">#{ticket.id.slice(0,8)}</td>
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
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/accessadmin/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
                      >
                        Manage <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
