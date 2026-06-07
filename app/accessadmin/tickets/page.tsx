import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

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
    <div>
      <h1 className="text-3xl font-bold mb-6">Support Tickets</h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">🎫 No tickets yet</p>
            <p className="text-gray-400 text-sm">When users open support tickets, they will appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Subject</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Priority</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Replies</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 font-mono text-sm">#{ticket.id.slice(0,8)}</td>
                  <td className="px-6 py-4 font-medium">{ticket.subject}</td>
                  <td className="px-6 py-4">
                    {ticket.user.username}<br />
                    <span className="text-sm text-gray-500">{ticket.user.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      ticket.status === 'open' ? 'bg-red-100 text-red-700' :
                      ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">{ticket.replies.length}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/accessadmin/tickets/${ticket.id}`} className="text-blue-600 hover:underline">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
