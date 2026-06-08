'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useSettings } from '@/context/SettingsContext'
import { ProfileDropdown } from '@/components/ui/ProfileDropdown'
import { Menu, X, Home, ShoppingBag, Info, HelpCircle, Mail } from 'lucide-react'
import { useState } from 'react'

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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900 shadow-lg shadow-purple-500/20 border-b border-purple-400/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-extrabold text-white hover:scale-105 transition flex items-center gap-2">
          <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
            {siteName}
          </span>
          <span className="text-xs font-normal text-purple-200 hidden sm:inline">✦ Premium</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                ${pathname === link.href 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
                }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="text-sm text-purple-200 animate-pulse">Loading...</div>
          ) : session ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/accessadmin"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold shadow-lg shadow-red-500/30 hover:scale-105 hover:shadow-red-500/50 transition-all flex items-center gap-2"
                >
                  <span className="animate-pulse">●</span>
                  Admin
                </Link>
              )}
              <ProfileDropdown />
            </div>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold shadow-lg shadow-yellow-500/30 hover:scale-105 hover:shadow-yellow-500/50 transition-all flex items-center gap-2"
            >
              <span>✦</span>
              Login
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white hover:text-yellow-300 transition p-2 rounded-lg hover:bg-white/10"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gradient-to-b from-purple-800 to-indigo-900 border-t border-purple-500/30 p-4 animate-fade-in">
          <nav className="flex flex-col gap-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg transition-all flex items-center gap-3
                  ${pathname === link.href 
                    ? 'bg-white/10 text-white' 
                    : 'text-purple-200 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
            {!session && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-center mt-2"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
