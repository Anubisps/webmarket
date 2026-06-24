import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import {
  Settings, CreditCard, Shield, Bell, Tag, Sliders, ChevronRight, Sparkles,
} from 'lucide-react'

const sections = [
  {
    href: '/accessadmin/settings/general',
    label: 'General',
    desc: 'Site name, branding, and global options',
    icon: Sliders,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    href: '/accessadmin/settings/payments',
    label: 'Payments',
    desc: 'Auto & manual gateways, Stripe, PayPal, crypto',
    icon: CreditCard,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    href: '/accessadmin/settings/discounts',
    label: 'Discount Codes',
    desc: 'Coupons by product, category, or store-wide',
    icon: Tag,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    href: '/accessadmin/settings/security',
    label: 'Security',
    desc: 'Admin security and access controls',
    icon: Shield,
    color: 'from-violet-500 to-purple-500',
  },
  {
    href: '/accessadmin/settings/notice',
    label: 'Site Notice',
    desc: 'Banner and announcement messages',
    icon: Bell,
    color: 'from-pink-500 to-rose-500',
  },
]

export default async function SettingsHubPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || !['admin', 'manager'].includes(user.role)) redirect('/dashboard')

  const paymentCount = await prisma.paymentSetting.count({ where: { enabled: true } })
  const discountCount = await prisma.discount.count()

  return (
    <div className="min-h-screen text-white">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
          <Settings className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-medium text-gray-300">Settings</span>
        </div>
        <h1 className="text-3xl font-extrabold md:text-4xl">
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Control Center
          </span>
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Manage payments, discounts, security, and site configuration from one place.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-300/70">Active payments</p>
          <p className="mt-1 text-2xl font-bold text-emerald-300">{paymentCount}</p>
        </div>
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-xs uppercase tracking-wide text-yellow-300/70">Discount codes</p>
          <p className="mt-1 text-2xl font-bold text-yellow-300">{discountCount}</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 md:col-span-1">
          <p className="text-xs uppercase tracking-wide text-violet-300/70">Sections</p>
          <p className="mt-1 text-2xl font-bold text-violet-300">{sections.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sections.map(section => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg transition hover:border-violet-500/30 hover:bg-white/[0.07] hover:shadow-[0_0_40px_rgba(139,92,246,0.1)]"
          >
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${section.color} shadow-lg`}>
              <section.icon className="h-7 w-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-lg group-hover:text-violet-300 transition">{section.label}</h2>
              <p className="text-sm text-gray-400">{section.desc}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-500 transition group-hover:translate-x-1 group-hover:text-violet-400" />
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
        <p className="flex items-center gap-2 text-sm text-cyan-200">
          <Sparkles className="h-4 w-4" />
          Tip: Enable <strong>Test Mode</strong> on any auto payment provider to simulate checkout without charging real money.
        </p>
      </div>
    </div>
  )
}
