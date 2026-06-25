'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Search, ScrollText } from 'lucide-react'

type AuditEntry = {
  id: string
  userId: string | null
  actorEmail: string | null
  action: string
  entity: string
  entityId: string | null
  details: Record<string, unknown> | null
  ip: string | null
  createdAt: string
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [entity, setEntity] = useState('')
  const [action, setAction] = useState('')
  const [actor, setActor] = useState('')
  const [applied, setApplied] = useState({ entity: '', action: '', actor: '' })
  const [offset, setOffset] = useState(0)
  const [error, setError] = useState('')
  const limit = 50

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      })
      if (applied.entity.trim()) params.set('entity', applied.entity.trim())
      if (applied.action.trim()) params.set('action', applied.action.trim())
      if (applied.actor.trim()) params.set('actor', applied.actor.trim())

      const res = await fetch(`/api/admin/audit-log?${params}`, { cache: 'no-store' })
      const data = await res.json().catch(() => null)

      if (!data) {
        setError('Invalid response from server')
        setLogs([])
        setTotal(0)
        return
      }

      if (!res.ok) {
        setError(data.error || `Failed to load (${res.status})`)
        setLogs([])
        setTotal(0)
        return
      }

      const items: AuditEntry[] = Array.isArray(data) ? data : (data.logs ?? [])
      setLogs(items)
      setTotal(Array.isArray(data) ? data.length : (data.total ?? items.length))
    } catch {
      setError('Network error loading audit log')
      setLogs([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [applied, offset])

  useEffect(() => {
    load()
  }, [load])

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    setApplied({ entity, action, actor })
    setOffset(0)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={applyFilters} className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-4">
        <input
          type="text"
          placeholder="Entity (order, user…)"
          value={entity}
          onChange={e => setEntity(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
        />
        <input
          type="text"
          placeholder="Action (payment.confirmed…)"
          value={action}
          onChange={e => setAction(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
        />
        <input
          type="text"
          placeholder="Actor email"
          value={actor}
          onChange={e => setActor(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white"
        >
          <Search className="h-4 w-4" />
          Filter
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>{total} total entries</span>
        <button onClick={load} className="inline-flex items-center gap-2 hover:text-white">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && (logs?.length ?? 0) === 0 ? (
        <p className="py-12 text-center text-gray-500">Loading audit log…</p>
      ) : (logs?.length ?? 0) === 0 ? (
        <p className="py-12 text-center text-gray-500">No audit entries yet. Actions like payments, refunds, and order changes are logged automatically.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-white/10 bg-black/30 text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">IP</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).map(log => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-violet-300">{log.action}</td>
                  <td className="px-4 py-3">
                    <span className="text-cyan-300">{log.entity}</span>
                    {log.entityId && (
                      <span className="ml-1 font-mono text-xs text-gray-500">#{log.entityId.slice(0, 8)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{log.actorEmail || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{log.ip || '—'}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-gray-500">
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > limit && (
        <div className="flex justify-center gap-3">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="py-2 text-sm text-gray-400">
            {offset + 1}–{Math.min(offset + limit, total)} of {total}
          </span>
          <button
            disabled={offset + limit >= total}
            onClick={() => setOffset(offset + limit)}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
