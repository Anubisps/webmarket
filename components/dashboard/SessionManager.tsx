'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Monitor, Trash2 } from 'lucide-react'
import { csrfHeaders } from '@/lib/csrfClient'

export function SessionManager() {
  const [sessions, setSessions] = useState<any[]>([])

  const load = () => {
    fetch('/api/user/sessions').then(r => r.json()).then(setSessions).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const revokeAll = async () => {
    const res = await fetch('/api/user/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
      body: JSON.stringify({ all: true }),
    })
    if (res.ok) {
      toast.success('All sessions revoked')
      load()
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Monitor className="w-5 h-5 text-cyan-400" /> Active sessions
      </h2>
      {sessions.length === 0 ? (
        <p className="text-gray-400 text-sm">No tracked sessions yet.</p>
      ) : (
        <ul className="space-y-2 mb-4">
          {sessions.map(s => (
            <li key={s.id} className="flex justify-between rounded-xl bg-black/30 px-4 py-2 text-sm">
              <span>{s.userAgent?.slice(0, 40) || 'Unknown device'}</span>
              <span className="text-gray-500">{new Date(s.lastActive).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
      <button onClick={revokeAll} className="inline-flex items-center gap-2 rounded-xl bg-rose-500/15 px-4 py-2 text-sm text-rose-300">
        <Trash2 className="w-4 h-4" /> Revoke all sessions
      </button>
    </div>
  )
}
