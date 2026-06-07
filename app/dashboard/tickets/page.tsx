import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Ticket, MessageSquare, Plus, Clock, CheckCircle, AlertCircle, XCircle, Calendar } from 'lucide-react'
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
    open: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Open' },
    'in-progress': { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'In Progress' },
    resolved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Resolved' },
    closed: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Closed' },
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ticket className="w-8 h-8 text-purple-600" />
            Support Tickets
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your support requests</p>
        </div>
        <Link
          href="/dashboard/tickets/new"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:scale-105 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </Link>
      </div>

      {user.tickets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No support tickets yet.</p>
          <p className="text-gray-400 text-sm">Need help? Create a ticket and our team will assist you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.tickets.map(ticket => {
            const StatusIcon = statusConfig[ticket.status as keyof typeof statusConfig]?.icon || Clock
            const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || { color: 'text-gray-600', bg: 'bg-gray-100', label: ticket.status }
            return (
              <Link
                key={ticket.id}
                href={`/dashboard/tickets/${ticket.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-[1.02] overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-purple-600 transition">
                        {ticket.subject}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.bg} ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {ticket.message}
                  </p>
                  {ticket.order && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500">Order: #{ticket.order.id.slice(0,8)}</span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
