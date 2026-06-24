'use client'
import { useCallback, useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  Activity, Users, Eye, ShoppingCart, DollarSign, Monitor, Smartphone,
  Tablet, UserCheck, Globe, RefreshCw, TrendingUp, Package,
} from 'lucide-react'

type DashboardData = {
  overview: {
    totalRevenue: number
    totalOrders: number
    totalUsers: number
    totalProducts: number
    totalSessions: number
    activeNow: number
    onlineLoggedIn: number
    onlineGuests: number
    pageviewsToday: number
    pageviews7d: number
  }
  charts: {
    days: { date: string; pageviews: number; orders: number; revenue: number; signups: number }[]
    deviceBreakdown: { Desktop: number; Mobile: number; Tablet: number }
    topPages: { path: string; views: number }[]
    topProducts: { name: string; quantity: number }[]
  }
  live: {
    activeSessions: LiveSession[]
    onlineLoggedIn: LiveSession[]
    onlineGuests: LiveSession[]
  }
  recentOrders: { id: string; total: number; status: string; username: string; createdAt: string }[]
}

type LiveSession = {
  sessionId: string
  ip: string
  device: string
  active: boolean
  duration: string
  pages: string[]
  pageCount: number
  isLoggedIn: boolean
  username: string | null
  currentPage: string
  lastVisit: string
}

const COLORS = ['#8b5cf6', '#06b6d4', '#f472b6', '#34d399', '#fbbf24']

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: any; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <Icon className={`h-5 w-5 ${accent}`} />
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  )
}

function LiveVisitorRow({ session }: { session: LiveSession }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 p-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <div className="min-w-0">
          {session.isLoggedIn ? (
            <p className="flex items-center gap-1 font-medium text-violet-300">
              <UserCheck className="h-3.5 w-3.5" />
              {session.username || 'Logged-in user'}
            </p>
          ) : (
            <p className="flex items-center gap-1 font-medium text-gray-300">
              <Globe className="h-3.5 w-3.5" />
              Guest visitor
            </p>
          )}
          <p className="truncate text-xs text-gray-500">{session.currentPage}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>{session.device}</span>
        <span>{session.pageCount} pages</span>
        <span className="text-emerald-400">{session.duration}</span>
      </div>
    </div>
  )
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'live' | 'business'>('overview')
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/analytics/dashboard')
      if (res.ok) {
        setData(await res.json())
        setLastRefresh(new Date())
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [load])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
        Loading analytics...
      </div>
    )
  }

  if (!data) {
    return <div className="py-20 text-center text-gray-400">Failed to load analytics.</div>
  }

  const { overview, charts, live, recentOrders } = data
  const deviceData = [
    { name: 'Desktop', value: charts.deviceBreakdown.Desktop, icon: Monitor },
    { name: 'Mobile', value: charts.deviceBreakdown.Mobile, icon: Smartphone },
    { name: 'Tablet', value: charts.deviceBreakdown.Tablet, icon: Tablet },
  ].filter(d => d.value > 0)

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'live' as const, label: `Live (${overview.activeNow})` },
    { id: 'business' as const, label: 'Business' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : 'Refresh'}
        </button>
      </div>

      {/* Live stats bar — always visible */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <StatCard label="Online Now" value={overview.activeNow} icon={Activity} accent="text-emerald-400" />
        <StatCard label="Logged In" value={overview.onlineLoggedIn} icon={UserCheck} accent="text-violet-400" />
        <StatCard label="Guests" value={overview.onlineGuests} icon={Globe} accent="text-cyan-400" />
        <StatCard label="Views Today" value={overview.pageviewsToday} icon={Eye} accent="text-blue-400" />
        <StatCard label="Views (7d)" value={overview.pageviews7d} icon={TrendingUp} accent="text-fuchsia-400" />
        <StatCard label="Total Users" value={overview.totalUsers} icon={Users} accent="text-amber-400" />
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 font-bold">Traffic & Signups (7 days)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.days}>
                    <defs>
                      <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="suGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: 12 }} />
                    <Legend />
                    <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke="#8b5cf6" fill="url(#pvGrad)" />
                    <Area type="monotone" dataKey="signups" name="Signups" stroke="#06b6d4" fill="url(#suGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 font-bold">Orders & Revenue (7 days)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" stroke="#888" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#888" fontSize={12} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: 12 }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#f472b6" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#34d399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 font-bold">Top Pages (7 days)</h3>
              {charts.topPages.length === 0 ? (
                <p className="text-gray-500">No pageview data yet.</p>
              ) : (
                <div className="space-y-2">
                  {charts.topPages.map((p, i) => (
                    <div key={p.path} className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
                      <span className="truncate text-sm text-gray-300">
                        <span className="mr-2 text-violet-400">#{i + 1}</span>
                        {p.path}
                      </span>
                      <span className="shrink-0 font-bold text-cyan-400">{p.views}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 font-bold">Active Devices</h3>
              {deviceData.length === 0 ? (
                <p className="text-gray-500">No active visitors right now.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {deviceData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: 12 }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'live' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-violet-300">
              <UserCheck className="h-5 w-5" />
              Logged-in Users Online ({live.onlineLoggedIn.length})
            </h3>
            {live.onlineLoggedIn.length === 0 ? (
              <p className="text-gray-500">No logged-in users browsing right now.</p>
            ) : (
              <div className="max-h-[480px] space-y-2 overflow-y-auto">
                {live.onlineLoggedIn.map(s => (
                  <LiveVisitorRow key={s.sessionId} session={s} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-cyan-300">
              <Globe className="h-5 w-5" />
              Guest Visitors Online ({live.onlineGuests.length})
            </h3>
            {live.onlineGuests.length === 0 ? (
              <p className="text-gray-500">No guest visitors right now.</p>
            ) : (
              <div className="max-h-[480px] space-y-2 overflow-y-auto">
                {live.onlineGuests.map(s => (
                  <LiveVisitorRow key={s.sessionId} session={s} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 font-bold">All Active Sessions</h3>
            {live.activeSessions.length === 0 ? (
              <p className="text-gray-500">No active sessions.</p>
            ) : (
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {live.activeSessions.map(s => (
                  <LiveVisitorRow key={s.sessionId} session={s} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'business' && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total Revenue" value={`$${overview.totalRevenue.toFixed(2)}`} icon={DollarSign} accent="text-emerald-400" />
            <StatCard label="Total Orders" value={overview.totalOrders} icon={ShoppingCart} accent="text-fuchsia-400" />
            <StatCard label="Products" value={overview.totalProducts} icon={Package} accent="text-violet-400" />
            <StatCard label="Sessions (30d)" value={overview.totalSessions} icon={Activity} accent="text-cyan-400" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 font-bold">Best Selling Products</h3>
              {charts.topProducts.length === 0 ? (
                <p className="text-gray-500">No sales yet.</p>
              ) : (
                <div className="space-y-3">
                  {charts.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
                      <span className="text-sm">
                        <span className="mr-2 text-gray-500">#{i + 1}</span>
                        {p.name}
                      </span>
                      <span className="font-bold text-violet-400">{p.quantity} sold</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 font-bold">Recent Orders</h3>
              {recentOrders.length === 0 ? (
                <p className="text-gray-500">No orders yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-sm">
                      <span className="text-gray-300">
                        #{order.id.slice(0, 8)} · {order.username}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">${order.total.toFixed(2)}</span>
                        <span className={`rounded px-2 py-0.5 text-xs ${
                          order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          order.status === 'cancelled' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
