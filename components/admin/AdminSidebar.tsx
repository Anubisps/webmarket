'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Ticket, 
  BarChart3,
  Settings,
  CreditCard,
  Tag,
  Globe,
  Shield,
  LogOut,
  Sparkles,
  Home,
  Mail,
  MessageCircle,
  Gift,
  Folder
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

interface AdminSidebarProps {
  basePath?: string
}

export function AdminSidebar({ basePath = '/accessadmin' }: AdminSidebarProps) {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/admin/contact')
      const data = await res.json()
      const unread = data.filter((m: any) => !m.isRead).length
      setUnreadCount(unread)
    } catch (err) {
      console.error('Failed to fetch unread count')
    }
  }

  useEffect(() => {
    fetchUnreadCount()
  }, [])

  const links = [
    { href: `${basePath}`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `${basePath}/products`, label: 'Products', icon: Package },
    { href: `${basePath}/orders`, label: 'Orders', icon: ShoppingCart },
    { href: `${basePath}/users`, label: 'Users', icon: Users },
    { href: `${basePath}/tickets`, label: 'Tickets', icon: Ticket },
    { href: `${basePath}/contact`, label: 'Contact', icon: Mail, badge: unreadCount },
    { href: `${basePath}/livechat`, label: 'Live Chat', icon: MessageCircle },
    { href: `${basePath}/analytics`, label: 'Analytics', icon: BarChart3 },
    { href: `${basePath}/categories`, label: 'Categories', icon: Folder },
    { href: `${basePath}/affiliates`, label: 'Affiliates', icon: Gift },
    { href: `${basePath}/settings/general`, label: 'General', icon: Globe },
    { href: `${basePath}/settings/payments`, label: 'Payments', icon: CreditCard },
    { href: `${basePath}/settings/discounts`, label: 'Discounts', icon: Tag },
    { href: `${basePath}/settings/security`, label: 'Security', icon: Shield },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-[#0f0f1a] border-r border-white/10 flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            WindVault
          </h2>
        </div>
        <p className="text-xs text-gray-400">Admin Panel</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {links.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname === href ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium flex-1">{label}</span>
            {badge !== undefined && badge > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all w-full"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm font-medium">User Dashboard</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
