'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSettings } from '@/context/SettingsContext'

export function Footer() {
  const pathname = usePathname()
  const { settings } = useSettings()

  // Hide footer on admin pages
  if (pathname.startsWith('/accessadmin')) {
    return null
  }

  const footerText = settings.footer_text || '© 2026 WindVault Market. All rights reserved.'
  const facebookUrl = settings.facebook_url || ''
  const twitterUrl = settings.twitter_url || ''
  const instagramUrl = settings.instagram_url || ''

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-gradient mb-4">WindVault Market</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
              The premier 3rd-party gaming marketplace. Fully secure & encrypted. Built for gamers, by gamers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 transition">Products</Link></li>
              <li><Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 transition">About</Link></li>
              <li><Link href="/faq" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 transition">FAQ</Link></li>
              <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Social</h4>
            <div className="space-y-2 text-sm">
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="block text-gray-600 dark:text-gray-400 hover:text-purple-600 transition">
                  Facebook
                </a>
              )}
              {twitterUrl && (
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="block text-gray-600 dark:text-gray-400 hover:text-purple-600 transition">
                  Twitter
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="block text-gray-600 dark:text-gray-400 hover:text-purple-600 transition">
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>{footerText}</p>
        </div>
      </div>
    </footer>
  )
}
