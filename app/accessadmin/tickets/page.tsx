import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Ticket } from 'lucide-react'
import { AdminTicketsBoard } from './AdminTicketsBoard'

export default async function AdminTickets() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || !['admin', 'manager', 'support'].includes(user.role)) redirect('/dashboard')

  const tickets = await prisma.ticket.findMany({
    include: {
      user: { select: { username: true, email: true } },
      replies: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length

  return (
    <div className="min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] h-[65%] w-[65%] rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-[-25%] right-[-15%] h-[65%] w-[65%] rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
            <Ticket className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-medium text-gray-300">Support Queue</span>
          </div>
          <h1 className="text-3xl font-extrabold md:text-4xl">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Ticket Center
            </span>
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            {tickets.length} total · {openCount} active — filter by status or search
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { label: 'Total', value: tickets.length, color: 'text-white' },
            { label: 'Open', value: tickets.filter(t => t.status === 'open').length, color: 'text-rose-300' },
            { label: 'In Progress', value: tickets.filter(t => t.status === 'in-progress').length, color: 'text-sky-300' },
            { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, color: 'text-emerald-300' },
            { label: 'Closed', value: tickets.filter(t => t.status === 'closed').length, color: 'text-gray-400' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <AdminTicketsBoard
          tickets={tickets.map(t => ({ ...t, createdAt: t.createdAt.toISOString() }))}
        />
      </div>
    </div>
  )
}
