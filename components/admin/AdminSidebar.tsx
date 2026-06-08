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
  LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface AdminSidebarProps {
  basePath?: string
}

export function AdminSidebar({ basePath = '/accessadmin' }: AdminSidebarProps) {
  const pathname = usePathname()

  const links = [
    { href: `${basePath}`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `${basePath}/products`, label: 'Products', icon: Package },
    { href: `${basePath}/orders`, label: 'Orders', icon: ShoppingCart },
    { href: `${basePath}/users`, label: 'Users', icon: Users },
    { href: `${basePath}/tickets`, label: 'Tickets', icon: Ticket },
    { href: `${basePath}/analytics`, label: 'Analytics', icon: BarChart3 },
    { href: `${basePath}/settings/general`, label: 'General', icon: Globe },
    { href: `${basePath}/settings/payments`, label: 'Payments', icon: CreditCard },
    { href: `${basePath}/settings/discounts`, label: 'Discounts', icon: Tag },
    { href: `${basePath}/settings/security`, label: 'Security', icon: Shield },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          WindVault Admin
        </h2>
        <p className="text-sm text-gray-400">Manage your marketplace</p>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              pathname === href ? 'bg-purple-600 shadow-lg shadow-purple-600/20' : 'hover:bg-gray-800'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-700">
        <button
          onClick={async () => {
            await signOut({ redirect: false })
            window.location.assign('/')
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 transition w-full"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
