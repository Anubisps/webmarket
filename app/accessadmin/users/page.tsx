import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminUsers() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || !['admin', 'manager'].includes(user.role)) {
    redirect('/dashboard')
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No users yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Username</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-6 py-4 font-medium">{u.username}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      u.role === 'admin' ? 'bg-red-100 text-red-700' :
                      u.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'support' ? 'bg-blue-100 text-blue-700' :
                      u.role === 'processor' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      u.banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {u.banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/accessadmin/users/${u.id}`} className="text-blue-600 hover:underline">
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
