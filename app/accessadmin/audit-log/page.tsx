import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ScrollText } from 'lucide-react'
import { AuditLogViewer } from './AuditLogViewer'

export default async function AuditLogPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user || !['admin', 'manager'].includes(user.role)) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
          <ScrollText className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-medium text-gray-300">Security</span>
        </div>
        <h1 className="text-3xl font-extrabold md:text-4xl">
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Audit Log
          </span>
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Track payments, refunds, order changes, security events, and admin actions.
        </p>
      </div>

      <AuditLogViewer />
    </div>
  )
}
