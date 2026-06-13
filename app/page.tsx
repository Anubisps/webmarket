import Link from 'next/link'
import { prisma } from '@/lib/db'
import { 
  ArrowRight, Shield, Zap, Clock, Star, Lock, CreditCard, Users, Flame, Gem, Rocket 
} from 'lucide-react'

export default async function Home() {
  // Fetch limited (event) products
  const limitedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      isLimited: true
    },
    include: {
      category: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 4
  })

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      
      {/* Starfield background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,10,60,0.3)_0%,_#0a0a0f_100%)]"></div>
        <div className="stars-layer absolute inset-0">
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-pink-600/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 overflow-hidden pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block px-6 py-2 mb-6 rounded-full bg-white/5 backdrop-blur-md border border-white/20 shadow-lg">
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              🔒 100% Secure • 3rd-Party Marketplace
            </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-extrabold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
              WindVault Market
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            The premier 3rd-party gaming marketplace. Fully secure & encrypted. <br />
            Built for gamers, by gamers.
          </p>
          <div className="flex flex-wrap gap-5 justify-center">
            <Link 
              href="/products" 
              className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 flex items-center gap-2 overflow-hidden"
            >
              <span className="relative z-10">Browse Products</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link 
              href="/about" 
              className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:bg-white/20 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Security Badges */}
      <section className="relative z-10 py-8 border-y border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { icon: Lock, label: "SSL Encrypted", color: "text-emerald-400" },
              { icon: Shield, label: "Fraud Protection", color: "text-cyan-400" },
              { icon: CreditCard, label: "Secure Payments", color: "text-purple-400" },
              { icon: Users, label: "10,000+ Users", color: "text-pink-400" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:scale-105 transition-transform duration-300">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-sm font-medium text-gray-200">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Why Choose WindVault?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience the future of digital marketplaces
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Secure & Encrypted", desc: "Every transaction protected with industry-standard encryption.", gradient: "from-purple-500 to-pink-500" },
              { icon: Zap, title: "Instant Delivery", desc: "Get your products immediately after payment confirmation.", gradient: "from-blue-500 to-cyan-500" },
              { icon: Clock, title: "24/7 Support", desc: "Our team is always here to help with any issues.", gradient: "from-green-500 to-emerald-500" }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Limited Event Products */}
      <section className="relative z-10 py-24 bg-black/40 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
              <Flame className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Limited Time</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Event Products
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Grab these exclusive offers before they vanish
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {limitedProducts.length === 0 ? (
              <div className="col-span-4 text-center py-16 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                <Gem className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 text-lg">No limited products available right now.</p>
                <p className="text-gray-500 text-sm">Check back soon for exciting deals!</p>
              </div>
            ) : (
              limitedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-purple-500/50 hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 relative">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300"></div>
                    <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Flame className="w-3 h-3" /> LIMITED
                    </div>
                    {product.category?.name && (
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {product.category.name}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-purple-400 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400">USDC</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span>4.9</span>
                      </div>
                      <span className="text-sm font-medium text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-pink-900/30 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl">
            <div className="inline-flex p-3 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
              <Rocket className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Ready to Start?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of happy gamers today and experience the future of digital marketplaces.
            </p>
            <div className="flex flex-wrap gap-5 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
              >
                Create Free Account
              </Link>
              <Link
                href="/products"
                className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: star-twinkle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
