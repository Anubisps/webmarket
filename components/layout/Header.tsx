'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useSettings } from '@/context/SettingsContext'
import { ProfileDropdown } from '@/components/ui/ProfileDropdown'
import { Menu, X, Home, ShoppingBag, Info, HelpCircle, Mail, LayoutDashboard, Bell } from 'lucide-react'
import { useState } from 'react'
import { UnreadBadge } from '@/components/ui/UnreadBadge'

export function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { settings } = useSettings()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Hide header on admin pages
  if (pathname.startsWith('/accessadmin')) {
    return null
  }

  const siteName = settings.site_name || 'WindVault'
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'manager'

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Products', icon: ShoppingBag },
    { href: '/about', label: 'About', icon: Info },
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
    { href: '/contact', label: 'Contact', icon: Mail },
  ]

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 border-b border-purple-400/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold text-white hover:scale-105 transition flex items-center gap-2">
          <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
            {siteName}
          </span>
          <span className="text-xs font-normal text-purple-200 hidden sm:inline">✦ Premium</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                pathname === link.href 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="text-sm text-purple-200 animate-pulse">Loading...</div>
          ) : session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/notifications"
                className="relative hidden sm:flex p-2 rounded-lg text-purple-200 hover:bg-white/10 hover:text-white transition"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <UnreadBadge className="absolute -top-0.5 -right-0.5" />
              </Link>
              <Link
                href="/dashboard"
                className="relative px-4 py-2 rounded-lg bg-white text-indigo-900 font-semibold hover:scale-105 transition flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
                <UnreadBadge className="absolute -top-1 -right-1" />
              </Link>
              {isAdmin && (
                <Link
                  href="/accessadmin"
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium hover:scale-105 transition"
                >
                  Admin
                </Link>
              )}
              <ProfileDropdown />
            </div>
          ) : (
            <Link href="/login" className="px-4 py-2 rounded-lg bg-white text-indigo-900 font-semibold hover:scale-105 transition">
              Login
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white hover:text-yellow-300 transition"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-gradient-to-b from-purple-800 to-indigo-900 border-t border-purple-500/30 p-4">
          <nav className="flex flex-col gap-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                  pathname === link.href 
                    ? 'bg-white/10 text-white' 
                    : 'text-purple-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
