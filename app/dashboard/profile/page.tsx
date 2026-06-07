import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

export default async function ProfilePage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) redirect('/login')

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="mb-4">
          <p><strong>Username:</strong> {user.username}</p>
        </div>
        <div className="mb-4">
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <div className="mb-4">
          <p><strong>Role:</strong> {user.role}</p>
        </div>
        <div className="mb-4">
          <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
