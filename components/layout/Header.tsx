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

  // Hide header on admin pages
  if (pathname.startsWith('/accessadmin')) {
    return null
  }

  const siteName = settings.site_name || 'WindVault'
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'manager'

  return (
    <header className="bg-indigo-900 text-white py-4 shadow-lg border-b border-indigo-800">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent hover:scale-105 transition">
          {siteName}
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/products" className="hover:text-purple-200 transition">Products</Link>
          <Link href="/about" className="hover:text-purple-200 transition">About</Link>
          <Link href="/faq" className="hover:text-purple-200 transition">FAQ</Link>
          <Link href="/contact" className="hover:text-purple-200 transition">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="text-sm text-gray-400 animate-pulse">Loading...</div>
          ) : session ? (
            <div className="flex items-center gap-3">
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
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-white text-indigo-900 font-semibold hover:scale-105 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
