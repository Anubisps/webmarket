'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowRight, Search, Clock, CheckCircle, XCircle, AlertCircle, Package, CreditCard,
} from 'lucide-react'
import { formatPriceLabel } from '@/lib/formatPrice'

type OrderRow = {
  id: string
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string | null
  ign: string | null
  ignUsername: string | null
  createdAt: string
  user: { username: string; email: string }
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'processing', label: 'Processing' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
] as const

export function AdminOrdersBoard({ orders }: { orders: OrderRow[] }) {
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (tab !== 'all' && o.status !== tab) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        o.id.toLowerCase().includes(q) ||
        o.user.username.toLowerCase().includes(q) ||
        o.user.email.toLowerCase().includes(q) ||
        (o.ign || '').toLowerCase().includes(q)
      )
    })
  }, [orders, tab, search])

  const counts = {
    all: orders.length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  const statusStyle = (status: string) => {
    if (status === 'completed') return { icon: CheckCircle, color: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-500/30' }
    if (status === 'cancelled') return { icon: XCircle, color: 'text-rose-300', bg: 'bg-rose-500/15 border-rose-500/30' }
    return { icon: Clock, color: 'text-amber-300', bg: 'bg-amber-500/15 border-amber-500/30' }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'border border-white/10 bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {t.label} ({counts[t.id as keyof typeof counts]})
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none md:w-72"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-16 text-center text-gray-400">
          <Package className="mx-auto mb-3 h-12 w-12 opacity-50" />
          No orders match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map(order => {
            const st = statusStyle(order.status)
            const StatusIcon = st.icon
            const payColor =
              order.paymentStatus === 'paid' ? 'text-emerald-400' :
              order.paymentStatus === 'failed' ? 'text-rose-400' : 'text-amber-400'
            return (
              <div
                key={order.id}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-lg transition hover:border-emerald-500/30"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</p>
                    <p className="font-bold text-lg group-hover:text-emerald-300">{order.user.username}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium flex items-center gap-1 ${st.bg} ${st.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {order.status}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-black/20 p-2">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-bold text-emerald-400">{formatPriceLabel(order.total)}</p>
                  </div>
                  <div className="rounded-lg bg-black/20 p-2">
                    <p className="text-xs text-gray-500">Payment</p>
                    <p className={`font-medium capitalize ${payColor}`}>{order.paymentStatus}</p>
                  </div>
                  {order.ign && (
                    <div className="col-span-2 rounded-lg bg-black/20 p-2">
                      <p className="text-xs text-gray-500">Game ID</p>
                      <p className="font-mono text-sm">{order.ign}{order.ignUsername ? ` · ${order.ignUsername}` : ''}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1 capitalize">
                    <CreditCard className="h-3 w-3" />
                    {order.paymentMethod || 'manual'}
                  </span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>

                <Link
                  href={`/accessadmin/orders/${order.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-500/15 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/25"
                >
                  Manage order <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
