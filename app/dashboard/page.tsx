import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ShoppingBag, Ticket, Shield, ArrowRight, CheckCircle, XCircle, TrendingUp, Clock, Gift, Bell, Award } from 'lucide-react'
import { UnreadBadge } from '@/components/ui/UnreadBadge'
import { EmailVerifyBanner } from '@/components/dashboard/EmailVerifyBanner'
import { getUserLoyalty } from '@/lib/loyalty'

export default async function DashboardPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) redirect('/login')

  const orderCount = await prisma.order.count({
    where: { userId: user.id }
  })

  const ticketCount = await prisma.ticket.count({
    where: { userId: user.id }
  })

  const loyalty = await getUserLoyalty(user.id)
  const has2FA = user.twoFactorSecret !== null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white py-12">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-emerald-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-teal-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
              Welcome back, <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{user.username}</span>
            </h1>
            <p className="text-gray-400 text-lg">Here's what's happening with your account.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 md:mt-0">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleString()}
          </div>
        </div>

        {!user.isVerified && <EmailVerifyBanner />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Total Orders</p>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold">{orderCount}</p>
            <p className="text-xs text-gray-500 mt-1">+12% this month</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Support Tickets</p>
              <Ticket className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{ticketCount}</p>
            <p className="text-xs text-gray-500 mt-1">2 pending response</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-yellow-500/30 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Account Status</p>
              {user.isVerified ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
            <p className="text-lg font-bold">{user.isVerified ? 'Verified' : 'Unverified'}</p>
            {!user.isVerified && (
              <p className="text-xs text-amber-400 mt-1">Optional — verify anytime</p>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">2FA Security</p>
              {has2FA ? (
                <Shield className="w-4 h-4 text-green-400" />
              ) : (
                <Shield className="w-4 h-4 text-red-400" />
              )}
            </div>
            <p className="text-lg font-bold">{has2FA ? 'Enabled' : 'Disabled'}</p>
            {!has2FA && (
              <p className="text-xs text-red-400 mt-1">Enable 2FA for extra security</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link href="/dashboard/notifications" className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-violet-500/50 transition-all flex flex-col">
            <UnreadBadge className="absolute top-4 right-4" />
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Notifications</h3>
            </div>
            <p className="text-gray-400 text-sm flex-1">Order updates, refunds, restock alerts, and support replies.</p>
            <div className="mt-4 flex items-center justify-end gap-1 text-violet-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Open inbox <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Loyalty</h3>
            </div>
            {loyalty.qualified ? (
              <p className="text-emerald-400 text-sm flex-1">{loyalty.discountPercent}% off every order — thank you for your support!</p>
            ) : (
              <p className="text-gray-400 text-sm flex-1">
                ${loyalty.spent.toFixed(2)} spent · ${loyalty.remaining.toFixed(2)} until {loyalty.discountPercent}% off
              </p>
            )}
          </div>

          <Link href="/dashboard/orders" className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-emerald-500/50 transition-all flex flex-col">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Orders</h3>
            </div>
            <p className="text-gray-400 text-sm flex-1">View your order history and track deliveries.</p>
            <div className="mt-4 flex items-center justify-end gap-1 text-emerald-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              View Orders <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          <Link href="/dashboard/tickets" className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] transition-all flex flex-col">
            <UnreadBadge prefix="/dashboard/tickets" className="absolute top-4 right-4" />
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Support</h3>
            </div>
            <p className="text-gray-400 text-sm flex-1">Manage your support tickets and get help.</p>
            <div className="mt-4 flex items-center justify-end gap-1 text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              View Tickets <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          <Link href="/dashboard/affiliate" className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-yellow-500/50 hover:shadow-[0_0_40px_rgba(234,179,8,0.1)] transition-all flex flex-col">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Affiliate</h3>
            </div>
            <p className="text-gray-400 text-sm flex-1">Earn commission by referring friends.</p>
            <div className="mt-4 flex items-center justify-end gap-1 text-yellow-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              View Affiliate <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        </div>

      </div>
    </div>
  )
}
