'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  HelpCircle,
  Ticket,
  MessageCircle,
  Gift,
  BarChart3,
  Mail,
  Tag,
  Shield,
  CreditCard,
  Bell,
  LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'

export function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/accessadmin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/accessadmin/products', label: 'Products', icon: Package },
    { href: '/accessadmin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/accessadmin/users', label: 'Users', icon: Users },
    { href: '/accessadmin/faq', label: 'FAQ Management', icon: HelpCircle },
    { href: '/accessadmin/tickets', label: 'Tickets', icon: Ticket },
    { href: '/accessadmin/contact', label: 'Contact Messages', icon: Mail },
    { href: '/accessadmin/affiliates', label: 'Affiliates', icon: Gift },
    { href: '/accessadmin/categories', label: 'Categories', icon: Tag },
    { href: '/accessadmin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/accessadmin/livechat', label: 'Live Chat', icon: MessageCircle },
    { href: '/accessadmin/settings', label: 'Settings', icon: Settings },
    { href: '/accessadmin/settings/payments', label: 'Payments', icon: CreditCard },
    { href: '/accessadmin/settings/security', label: 'Security', icon: Shield },
    { href: '/accessadmin/settings/notice', label: 'Site Notice', icon: Bell },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 z-50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            WindVault Admin
          </h2>
          <p className="text-xs text-gray-500 mt-1">Control Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
