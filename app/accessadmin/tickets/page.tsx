import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Ticket } from 'lucide-react'
import { TicketsTable } from './TicketsTable'

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Ticket className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-gray-300">Tickets</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Support <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Tickets</span>
          </h1>
          <p className="text-gray-400 text-lg">{tickets.length} ticket(s) • newest first</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
        <TicketsTable
          tickets={tickets.map(ticket => ({
            ...ticket,
            createdAt: ticket.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  )
}
