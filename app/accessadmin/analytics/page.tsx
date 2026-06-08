'use client'
import { useState, useEffect } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Sparkles, TrendingUp, Box, Clock, DollarSign, ShoppingCart, Users, Package } from 'lucide-react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/admin/analytics')
      const json = await res.json()
      setData(json)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-8 text-center text-gray-400">Loading analytics...</div>

  const { totalRevenue, totalOrders, totalUsers, totalProducts, days, topProducts, recentOrders } = data

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-gray-300">Analytics</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Analytics</span>
          </h1>
          <p className="text-gray-400 text-lg">Track your store's performance.</p>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Total Revenue</p>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold">${totalRevenue?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Total Orders</p>
            <ShoppingCart className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-bold">{totalOrders}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Total Users</p>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-yellow-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Total Products</p>
            <Package className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold">{totalProducts}</p>
        </div>
      </div>

      {/* ===== CHART ===== */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Orders (Last 7 Days)
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis allowDecimals={false} stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#333', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="orders" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== BOTTOM GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Box className="w-5 h-5 text-yellow-400" />
            Best Selling Products
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                  <span className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">#{i + 1}</span>
                    {product.name}
                  </span>
                  <span className="font-bold text-emerald-400">{product.quantity} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Recent Orders
          </h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No recent orders</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                  <span className="text-gray-400">#{order.id.slice(0,8)} • {order.user.username}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-400">${order.total.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
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
    </div>
  )
}
