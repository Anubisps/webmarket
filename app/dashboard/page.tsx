import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ShoppingBag, Ticket, Shield, ArrowRight, CheckCircle, XCircle, UserCheck, Clock } from 'lucide-react'

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

  const has2FA = user.twoFactorSecret !== null

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user.username}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{orderCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Support Tickets</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{ticketCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Account Verified</p>
          <div className="flex items-center gap-2">
            {user.isVerified ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">
              {user.isVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">2FA Status</p>
          <div className="flex items-center gap-2">
            {has2FA ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">
              {has2FA ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/orders" className="block bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition transform hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Orders</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">View your order history</p>
          <span className="inline-flex items-center gap-1 text-purple-600 text-sm font-medium mt-2">
            View Orders <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link href="/dashboard/tickets" className="block bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition transform hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Support Tickets</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your support requests</p>
          <span className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium mt-2">
            View Tickets <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link href="/dashboard/security" className="block bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition transform hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage 2FA and account security</p>
          <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium mt-2">
            View Security <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </div>
  )
}
