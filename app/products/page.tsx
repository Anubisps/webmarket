import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowRight, Search, Filter, Sparkles, Star, TrendingUp, Box } from 'lucide-react'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white py-12">
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden py-16 mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0a0a0f]">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-gray-300">Premium Collection</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-2">
                All <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Products</span>
              </h1>
              <p className="text-gray-400 text-lg">Browse our complete catalog of premium gaming items.</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full md:w-64 pl-10 pr-4 py-3 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              </div>
              <button className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRODUCT GRID ===== */}
      <section className="container mx-auto px-4 pb-24">
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
            <Box className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No products found</h3>
            <p className="text-gray-400">Check back later for new arrivals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] transition-all duration-300"
              >
                <div className="h-48 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 relative">
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <span className="text-white text-xs font-medium px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                      {product.category}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs">4.9</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-1 group-hover:text-purple-400 transition-colors">{product.name}</h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {product.price.toFixed(2)} USDC
                    </span>
                    <span className="flex items-center gap-1 text-xs text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="bg-[#0f0f1a] border-y border-white/5 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <span className="text-sm font-medium text-gray-300">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-300">Instant Delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-300">24/7 Support</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-300">10k+ Users</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
