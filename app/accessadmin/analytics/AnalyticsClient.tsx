'use client'
import { useState } from 'react'
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Users } from 'lucide-react'

export function AnalyticsClient({ activeSessions, closedSessions }: { activeSessions: any[], closedSessions: any[] }) {
  return (
    <>
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Active Sessions ({activeSessions.length})
          </h2>
          <div className="space-y-3">
            {activeSessions.map((s) => (
              <SessionCard key={s.sessionId} session={s} />
            ))}
          </div>
        </div>
      )}

      {closedSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-gray-400" />
            Closed Sessions ({closedSessions.length})
          </h2>
          <div className="space-y-3">
            {closedSessions.map((s) => (
              <SessionCard key={s.sessionId} session={s} />
            ))}
          </div>
        </div>
      )}

      {activeSessions.length === 0 && closedSessions.length === 0 && (
        <div className="text-center py-20 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No sessions yet</h3>
          <p className="text-gray-400">Start tracking visitor sessions.</p>
        </div>
      )}
    </>
  )
}

function SessionCard({ session }: { session: any }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all">
      <div
        className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${session.active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
          <span className="font-mono text-sm text-purple-400">{session.sessionId.slice(0, 12)}…</span>
          <span className="text-xs text-gray-400">{session.ip}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">{session.count} events</span>
          <span className="text-gray-400">{session.pages.length} pages</span>
          <span className={`text-xs font-medium ${session.active ? 'text-emerald-400' : 'text-gray-400'}`}>
            {session.duration}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 pt-0 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
            <div className="text-gray-400">First visit: <span className="text-white">{new Date(session.firstVisit).toLocaleString()}</span></div>
            <div className="text-gray-400">Last visit: <span className="text-white">{new Date(session.lastVisit).toLocaleString()}</span></div>
            <div className="text-gray-400">User Agent: <span className="text-white text-xs block truncate">{session.userAgent}</span></div>
            <div className="text-gray-400">Pages visited: <span className="text-white">{session.pages.join(', ')}</span></div>
          </div>
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-400 mb-2">Event Timeline</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {session.events.map((event: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 text-xs text-gray-400 border-b border-white/5 py-1">
                  <span className="text-gray-500 w-32">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  <span className="text-purple-400">{event.path}</span>
                  <span className="text-gray-500">{event.method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
