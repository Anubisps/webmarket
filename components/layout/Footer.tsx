import Link from 'next/link'
import { MessageCircle, Mail, Shield, Zap, Clock, Globe, Share2, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative z-10 bg-black/40 backdrop-blur-md border-t border-white/10 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              WindVault
            </h3>
            <p className="text-sm text-gray-400">
              The premier 3rd-party gaming marketplace. Secure, fast, and trusted by thousands.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-purple-400 transition-colors">Products</Link></li>
              <li><Link href="/about" className="hover:text-purple-400 transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-purple-400 transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-purple-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard/tickets" className="hover:text-purple-400 transition-colors">Support Tickets</Link></li>
              <li><Link href="/dashboard/orders" className="hover:text-purple-400 transition-colors">My Orders</Link></li>
              <li><Link href="/dashboard/affiliate" className="hover:text-purple-400 transition-colors">Affiliate Program</Link></li>
              <li><Link href="/dashboard/security" className="hover:text-purple-400 transition-colors">Security</Link></li>
            </ul>
          </div>

          {/* Social & Contact – links are disabled (no href) */}
          <div>
            <h4 className="font-semibold text-white mb-3">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <span className="p-2 rounded-full bg-white/10 cursor-default opacity-60" aria-label="GitHub (disabled)">
                <Globe className="w-5 h-5" />
              </span>
              <span className="p-2 rounded-full bg-white/10 cursor-default opacity-60" aria-label="Twitter (disabled)">
                <Share2 className="w-5 h-5" />
              </span>
              <span className="p-2 rounded-full bg-white/10 cursor-default opacity-60" aria-label="Contact (disabled)">
                <Mail className="w-5 h-5" />
              </span>
              <span className="p-2 rounded-full bg-white/10 cursor-default opacity-60" aria-label="Live Chat (disabled)">
                <MessageCircle className="w-5 h-5" />
              </span>
            </div>
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} WindVault Market. <br />
              All rights reserved.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap justify-between items-center text-xs text-gray-500">
          <p>Secure & Encrypted Transactions</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-purple-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-purple-400">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
