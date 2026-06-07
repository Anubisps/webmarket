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
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="mb-4">{footerText}</p>
          <div className="flex justify-center gap-4 mb-4">
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                Facebook
              </a>
            )}
            {twitterUrl && (
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                Twitter
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                Instagram
              </a>
            )}
          </div>
          <div className="flex justify-center gap-4 text-sm text-gray-400">
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/refund" className="hover:text-white">Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
