import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Sparkles, Eye, Users, Activity, Clock, CheckCircle, XCircle } from 'lucide-react'
import { AnalyticsClient } from './AnalyticsClient'

function isSessionActive(lastTimestamp: Date): boolean {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return lastTimestamp > fiveMinutesAgo
}

function formatDuration(start: Date, end: Date): string {
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
}

export default async function AnalyticsPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user || !['admin', 'manager'].includes(user.role)) redirect('/dashboard')

  const allEvents = await prisma.analyticsEvent.findMany({
    orderBy: { timestamp: 'desc' },
    take: 1000,
  })

  const sessionsMap = new Map<string, any[]>()
  allEvents.forEach(event => {
    const key = event.sessionId || 'anonymous'
    if (!sessionsMap.has(key)) sessionsMap.set(key, [])
    sessionsMap.get(key)!.push(event)
  })

  const sessions = Array.from(sessionsMap.entries()).map(([sessionId, events]) => {
    const sorted = events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const active = isSessionActive(last.timestamp)
    const duration = active ? 'Active now' : formatDuration(first.timestamp, last.timestamp)
    const pages = [...new Set(sorted.map(e => e.path))]
    return {
      sessionId,
      events: sorted,
      firstVisit: first.timestamp,
      lastVisit: last.timestamp,
      active,
      duration,
      pages,
      ip: first.ip || 'unknown',
      userAgent: first.userAgent || 'unknown',
      count: sorted.length,
    }
  })

  const activeSessions = sessions.filter(s => s.active)
  const closedSessions = sessions.filter(s => !s.active)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300">Analytics</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Live Sessions
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Real-time visitor session tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Total Sessions</p>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold mt-2">{sessions.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Active Now</p>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold mt-2 text-emerald-400">{activeSessions.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Closed Sessions</p>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold mt-2">{closedSessions.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Total Events</p>
            <Eye className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold mt-2">{allEvents.length}</p>
        </div>
      </div>

      <AnalyticsClient activeSessions={activeSessions} closedSessions={closedSessions} />
    </div>
  )
}
