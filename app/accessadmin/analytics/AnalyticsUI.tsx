'use client'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface AnalyticsUIProps {
  data: {
    totalRevenue: number
    totalOrders: number
    totalUsers: number
    totalProducts: number
    days: { date: string; orders: number }[]
    topProducts: { name: string; quantity: number }[]
    recentOrders: any[]
  }
}

export function AnalyticsUI({ data }: AnalyticsUIProps) {
  const { totalRevenue, totalOrders, totalUsers, totalProducts, days, topProducts, recentOrders } = data
  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c']

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold">${totalRevenue?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold">{totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-3xl font-bold">{totalProducts}</p>
        </div>
      </div>

      {/* Chart - Orders per day */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4">Orders (Last 7 Days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="orders" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Best Selling Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">#{i + 1}</span>
                    {product.name}
                  </span>
                  <span className="font-bold">{product.quantity} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">#{order.id.slice(0, 8)} • {order.user.username}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">${order.total.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
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
