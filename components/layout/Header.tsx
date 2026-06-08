'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useSettings } from '@/context/SettingsContext'
import { ProfileDropdown } from '@/components/ui/ProfileDropdown'

export function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { settings } = useSettings()

  if (pathname.startsWith('/accessadmin')) {
    return null
  }

  const siteName = settings.site_name || 'WindVault'
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'manager'

  return (
    <header className="sticky top-0 z-40 bg-indigo-900/95 backdrop-blur-md text-white py-4 shadow-lg shadow-indigo-950/20 border-b border-indigo-800/50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent hover:scale-105 transition">
          {siteName}
        </Link>
        <nav className="hidden md:flex gap-6">
          {[
            { href: '/products', label: 'Products' },
            { href: '/about', label: 'About' },
            { href: '/faq', label: 'FAQ' },
            { href: '/contact', label: 'Contact' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-purple-200 transition ${pathname === link.href ? 'text-purple-200 font-medium' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="text-sm text-gray-400 animate-pulse">Loading...</div>
          ) : session ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/accessadmin"
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium hover:scale-105 transition shadow-sm"
                >
                  Admin
                </Link>
              )}
              <ProfileDropdown />
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-white text-indigo-900 font-semibold hover:scale-105 transition shadow-sm"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
