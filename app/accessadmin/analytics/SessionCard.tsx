'use client'
import { useState } from 'react'

export function SessionCard({ session }: { session: any }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex justify-between items-start"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-purple-400">
              {session.sessionId.substring(0, 8)}...
            </span>
            {session.isActive ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Live
              </span>
            ) : (
              <span className="text-xs text-gray-400">Closed</span>
            )}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Started: {new Date(session.startTime).toLocaleString()} · 
            {session.totalEvents} events · 
            Last: {new Date(session.lastActivity).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            IP: {session.ip} · {session.userAgent?.substring(0, 50)}...
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{session.totalEvents} events</span>
          <span className="text-gray-400">{expanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="space-y-2">
            {session.events.map((event: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 text-sm text-gray-300 border-b border-white/5 py-1">
                <span className="text-xs text-gray-500 w-24">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                <span className="font-mono text-xs text-purple-400">{event.path}</span>
                {event.referer && (
                  <span className="text-xs text-gray-500 truncate max-w-xs">
                    ← {event.referer}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
