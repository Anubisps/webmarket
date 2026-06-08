'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSettings } from '@/context/SettingsContext'

export function Footer() {
  const pathname = usePathname()
  const { settings } = useSettings()

  if (pathname.startsWith('/accessadmin')) {
    return null
  }

  const footerText = settings.footer_text || '\u00A9 2026 WindVault Market. All rights reserved.'
  const facebookUrl = settings.facebook_url || ''
  const twitterUrl = settings.twitter_url || ''
  const instagramUrl = settings.instagram_url || ''

  return (
    <footer className="bg-gray-900 dark:bg-[#0d1117] text-gray-300 py-10 border-t border-gray-800 dark:border-[var(--border)]">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          <p className="text-gray-400 dark:text-[var(--text-muted)]">{footerText}</p>
          <div className="flex justify-center gap-6">
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition">
                Facebook
              </a>
            )}
            {twitterUrl && (
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition">
                Twitter
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition">
                Instagram
              </a>
            )}
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/terms" className="text-gray-500 hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-white transition">Privacy</Link>
            <Link href="/refund" className="text-gray-500 hover:text-white transition">Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
