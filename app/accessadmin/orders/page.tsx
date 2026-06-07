import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminOrders() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || !['admin', 'manager', 'processor'].includes(user.role)) {
    redirect('/dashboard')
  }

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: { username: true, email: true }
      },
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">📦 No orders yet</p>
            <p className="text-gray-400 text-sm">When customers place orders, they will appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Payment</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-mono text-sm">#{order.id.slice(0,8)}</td>
                  <td className="px-6 py-4">
                    {order.user.username}<br />
                    <span className="text-sm text-gray-500">{order.user.email}</span>
                  </td>
                  <td className="px-6 py-4 font-bold">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                      order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/accessadmin/orders/${order.id}`} className="text-blue-600 hover:underline">Manage</Link>
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
