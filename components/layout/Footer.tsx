'use client'
import Link from 'next/link'
import { MessageCircle, Mail, Shield, Zap, Clock, Globe, Share2, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#0a0a0f] text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              WindVault
            </h3>
            <p className="text-sm leading-relaxed text-gray-300">
              The premier 3rd-party gaming marketplace. Secure, fast, and trusted by thousands.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/products', label: 'Products' },
                { href: '/about', label: 'About Us' },
                { href: '/faq', label: 'FAQ' },
                { href: '/contact', label: 'Contact' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-300 transition hover:text-purple-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-white">Support</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/dashboard/tickets', label: 'Support Tickets' },
                { href: '/dashboard/orders', label: 'My Orders' },
                { href: '/dashboard/affiliate', label: 'Affiliate Program' },
                { href: '/dashboard/security', label: 'Security' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-300 transition hover:text-purple-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-white">Connect</h4>
            <div className="mb-4 flex space-x-3">
              {[Globe, Share2, Mail, MessageCircle].map((Icon, i) => (
                <span key={i} className="cursor-default rounded-full bg-white/10 p-2 text-gray-300 opacity-70">
                  <Icon className="h-5 w-5" />
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} WindVault Market.
              <br />
              All rights reserved.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-gray-400">
          <p className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            Secure & Encrypted Transactions
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition hover:text-purple-300">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-purple-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
