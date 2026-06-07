import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Shield, Zap, Clock, ArrowRight, ShoppingCart, Sparkles, Star, Lock, CreditCard, Users, Flame } from 'lucide-react'

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 4
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-32">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '3s' }}></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-6 animate-pulse-glow border border-white/20">
            🔒 100% Secure • 3rd-Party Marketplace
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
            WindVault <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Market</span>
          </h1>
          <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
            The premier 3rd-party gaming marketplace. Fully secure & encrypted. Built for gamers, by gamers.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/products" className="bg-white text-purple-900 px-8 py-4 rounded-lg font-semibold hover:scale-105 transition flex items-center gap-2 shadow-lg shadow-purple-500/20">
              <ShoppingCart className="w-5 h-5" />
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/about" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-900 transition">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Security Badges */}
      <section className="bg-gray-900 text-white py-6 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Lock className="w-5 h-5 text-green-400" />
              <span className="text-sm">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm">Fraud Protection</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CreditCard className="w-5 h-5 text-green-400" />
              <span className="text-sm">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-sm">10,000+ Users</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Why Choose WindVault?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12">Built for speed, security, and trust.</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] group animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Encrypted</h3>
              <p className="text-gray-600 dark:text-gray-400">Every transaction protected with industry-standard encryption.</p>
            </div>
            <div className="glass-card p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] group animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Delivery</h3>
              <p className="text-gray-600 dark:text-gray-400">Get your products immediately after payment confirmation.</p>
            </div>
            <div className="glass-card p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] group animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-400">Our team is always here to help with any issues.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Featured Products
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12">Our most popular items right now</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <div className="col-span-4 text-center text-gray-500 py-8">
                No products available yet.
              </div>
            ) : (
              products.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-xl transition transform hover:scale-[1.02] animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="h-40 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition"></div>
                  </div>
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-purple-600 font-bold mt-2">${product.price.toFixed(2)}</p>
                  <div className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition text-center group-hover:shadow-lg group-hover:shadow-purple-500/20">
                    View Product
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Countdown Timer */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <Flame className="w-8 h-8" />
            Limited Time Event
          </h2>
          <p className="text-xl mb-8">Premium Arrow bundles – 40% off for 24 hours</p>
          <div className="flex justify-center gap-6 text-2xl font-bold">
            <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-lg animate-pulse-glow">
              <span className="block text-4xl">12</span>
              <span className="text-sm font-normal">Hours</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-lg animate-pulse-glow" style={{ animationDelay: '0.5s' }}>
              <span className="block text-4xl">34</span>
              <span className="text-sm font-normal">Minutes</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-lg animate-pulse-glow" style={{ animationDelay: '1s' }}>
              <span className="block text-4xl">56</span>
              <span className="text-sm font-normal">Seconds</span>
            </div>
          </div>
          <Link href="/products" className="mt-8 inline-block bg-white text-purple-700 px-8 py-4 rounded-lg font-bold hover:scale-105 transition shadow-lg shadow-white/20">
            Shop Now
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Ready to Start?
          </h2>
          <p className="text-xl text-purple-200 mb-8">Join thousands of happy gamers today.</p>
          <Link href="/register" className="bg-white text-indigo-900 px-8 py-4 rounded-lg font-bold hover:scale-105 transition shadow-lg shadow-white/20">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  )
}
