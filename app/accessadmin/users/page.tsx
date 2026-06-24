import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Users } from 'lucide-react'
import { UsersTable } from './UsersTable'

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
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      banned: true,
      twoFactorSecret: true,
      createdAt: true,
    },
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300">Users</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            All{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Users
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Manage your user base.</p>
        </div>
      </div>

      <UsersTable initialUsers={users} currentUserId={user.id} />
    </div>
  )
}
