import Link from 'next/link'
import { prisma } from '@/lib/db'
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Zap, 
  Clock, 
  ShoppingCart, 
  Star, 
  TrendingUp, 
  Globe,
  Box,
  Lock,
  CreditCard,
  Users
} from 'lucide-react'

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 4
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white">
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden py-32">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0a0a0f]">
          <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-[-30%] right-[-20%] w-[80%] h-[80%] bg-pink-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-8 animate-fade-in-up hover:border-purple-400 transition-colors">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-semibold text-gray-300">Next‑Gen Gaming Marketplace</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="text-white">WindVault </span>
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Market</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              The most secure, fastest, and most luxurious 3rd‑party gaming marketplace. Period.
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/products" className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:scale-105 transition-all duration-300">
                <ShoppingCart className="w-5 h-5" />
                Explore Products
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="bg-[#0f0f1a] border-y border-white/5 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">Instant Delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Global 24/7</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">10k+ Happy Users</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-24 bg-[#0a0a0f]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Built for <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Excellence</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Every feature designed to make your gaming experience seamless, secure, and luxurious.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Bank‑Level Security</h3>
              <p className="text-gray-400 text-center text-sm">End‑to‑end encryption with 2FA and advanced fraud protection.</p>
            </div>
            <div className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Lightning Fast Delivery</h3>
              <p className="text-gray-400 text-center text-sm">Instant product delivery after payment confirmation.</p>
            </div>
            <div className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(234,179,8,0.15)]">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">24/7 Expert Support</h3>
              <p className="text-gray-400 text-center text-sm">Dedicated support team ready around the clock.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-24 bg-[#0f0f1a] border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Trending <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Products</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Our most popular items this week, handpicked for you.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <div className="col-span-4 text-center py-12">
                <p className="text-gray-500">No products available yet. Stay tuned!</p>
              </div>
            ) : (
              products.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="h-48 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 relative">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <span className="absolute bottom-4 left-4 text-white text-xs font-medium px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-purple-400 transition-colors">{product.name}</h3>
                    <p className="text-2xl font-bold text-white">{product.price.toFixed(2)} USDC</p>
                    <div className="mt-4 w-full py-3 rounded-xl bg-white/10 text-center text-sm font-medium hover:bg-purple-600 hover:text-white transition-all duration-300">
                      View Details
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 bg-[#0a0a0f]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
                Ready to <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Elevate</span> Your Gaming?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of gamers already using WindVault Market today. It's free, secure, and fast.
              </p>
              <Link href="/register" className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] hover:scale-105 transition-all duration-300">
                Get Started Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER NOTE ===== */}
      <div className="text-center text-gray-500 text-sm py-6 border-t border-white/5 bg-[#0a0a0f]">
        <p>© 2026 WindVault Market. All rights reserved.</p>
      </div>
    </div>
  )
}
