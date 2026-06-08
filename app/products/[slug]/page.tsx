import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ArrowLeft, ShoppingCart, Shield, Zap, Clock, Star, Sparkles, Box, CheckCircle, Package, Truck, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug }
  })

  if (!product) {
    notFound()
  }

  // Premium features list
  const features = [
    { icon: Shield, text: '100% Secure Payment' },
    { icon: Zap, text: 'Instant Digital Delivery' },
    { icon: Clock, text: '24/7 Customer Support' },
    { icon: Package, text: 'Lifetime Warranty' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white py-12">
      
      {/* ===== BACKGROUND AMBIENCE ===== */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-pink-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        
        {/* ===== BACK BUTTON ===== */}
        <Link href="/products" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Products</span>
        </Link>

        {/* ===== MAIN PRODUCT CARD ===== */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.4)]">
          
          {/* Product Image Banner */}
          <div className="h-56 md:h-72 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-white">
                  <Sparkles className="w-3 h-3" />
                  {product.category}
                </span>
                {product.isLimited && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/80 backdrop-blur-md rounded-full text-xs font-medium text-white ml-2">
                    🔥 Limited Edition
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-sm font-medium">4.9</span>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{product.name}</h1>
                <p className="text-gray-400 text-lg">{product.description}</p>
              </div>
              <div className="text-right md:min-w-[180px]">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {product.price.toFixed(2)} USDC
                </div>
                <p className="text-xs text-gray-500 mt-1">+ tax (if applicable)</p>
              </div>
            </div>

            {/* ===== PREMIUM FEATURES BAR ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {features.map((feature, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5 hover:border-purple-500/30 transition-colors">
                  <feature.icon className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-medium text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* ===== STOCK & ACTIONS ===== */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  {product.stock > 0 ? (
                    <>
                      <Box className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">{product.stock} available</span>
                    </>
                  ) : (
                    <>
                      <Box className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-medium">Out of stock</span>
                    </>
                  )}
                </div>
                {product.discount && (
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 text-xs font-bold text-gray-900">
                    🔥 {product.discount}% OFF
                  </span>
                )}
              </div>

              <Link
                href={`/checkout/${product.id}`}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
                  product.stock > 0
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] hover:scale-105'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
              </Link>
            </div>
          </div>
        </div>

        {/* ===== EXTRA DETAILS SECTION ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold">Payment Methods</h3>
            </div>
            <p className="text-sm text-gray-400">Crypto, PayPal, Western Union, Ria, MoneyGram & more.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Truck className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold">Delivery</h3>
            </div>
            <p className="text-sm text-gray-400">Instant delivery after payment verification.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold">Guarantee</h3>
            </div>
            <p className="text-sm text-gray-400">100% satisfaction or full refund within 14 days.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
