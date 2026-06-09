import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Gift, Users, DollarSign, TrendingUp, ArrowRight, Search, Filter, Eye } from 'lucide-react'

export default async function AdminAffiliatesPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || !['admin', 'manager'].includes(user.role)) {
    redirect('/dashboard')
  }

  const affiliates = await prisma.affiliate.findMany({
    include: {
      user: {
        select: {
          username: true,
          email: true,
          createdAt: true
        }
      },
      referrals: {
        include: {
          order: {
            select: {
              id: true,
              total: true,
              createdAt: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Gift className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium text-gray-300">Affiliates</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Affiliate</span> Management
          </h1>
          <p className="text-gray-400 text-lg">{affiliates.length} affiliate(s)</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Code</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Commission</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Balance</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Referrals</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Joined</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p>No affiliates yet</p>
                  </td>
                </tr>
              ) : (
                affiliates.map(affiliate => {
                  const totalEarnings = affiliate.referrals.reduce((sum, r) => sum + r.commission, 0)
                  return (
                    <tr key={affiliate.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium">{affiliate.user.username}</td>
                      <td className="px-6 py-4 text-yellow-400 font-mono">{affiliate.code}</td>
                      <td className="px-6 py-4 text-emerald-400">{affiliate.commission}%</td>
                      <td className="px-6 py-4 text-yellow-400">${totalEarnings.toFixed(2)}</td>
                      <td className="px-6 py-4 text-blue-400">{affiliate.referrals.length}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(affiliate.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/accessadmin/affiliates/${affiliate.id}`}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
                        >
                          <Eye className="w-3 h-3" /> View
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
