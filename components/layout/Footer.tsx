'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSettings } from '@/context/SettingsContext'
import { Heart, Sparkles } from 'lucide-react' // Only imports that exist

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
    <footer className="bg-[#0a0a0f] border-t border-white/10 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                WindVault Market
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              The premier 3rd-party gaming marketplace. Fully secure & encrypted. Built for gamers, by gamers.
            </p>
            <div className="flex gap-4 mt-4">
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="text-lg font-bold">f</span>
                </a>
              )}
              {twitterUrl && (
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="text-lg font-bold">𝕏</span>
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="text-lg font-bold">📷</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-gray-400 hover:text-purple-400 transition-colors">Products</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-purple-400 transition-colors">About</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-purple-400 transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-purple-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-gray-400 hover:text-purple-400 transition-colors">Login</Link></li>
              <li><Link href="/register" className="text-gray-400 hover:text-purple-400 transition-colors">Register</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-purple-400 transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/profile" className="text-gray-400 hover:text-purple-400 transition-colors">Profile</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-gray-400 text-sm">{footerText}</p>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-pink-400 fill-current" />
            <span>by WindVault Team</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
