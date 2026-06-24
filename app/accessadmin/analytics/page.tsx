import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { BarChart3 } from 'lucide-react'
import { AnalyticsDashboard } from './AnalyticsDashboard'

export default async function AnalyticsPage() {
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
          <BarChart3 className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-medium text-gray-300">Analytics</span>
        </div>
        <h1 className="text-3xl font-extrabold md:text-4xl">
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Intelligence Dashboard
          </span>
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Live visitors, logged-in users, traffic charts, and business metrics — all in one place.
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}
