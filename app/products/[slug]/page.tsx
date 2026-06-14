import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Shield, 
  Zap, 
  Clock, 
  Star, 
  AlertCircle, 
  CheckCircle, 
  Truck, 
  Calendar 
} from 'lucide-react'
import Link from 'next/link'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { name: true }
      }
    }
  })

  if (!product) {
    notFound()
  }

  const firstImage = product.images && product.images.length > 0 ? product.images[0] : null
  const imageSrc = firstImage ? `/api/images/products/${firstImage.split('/').pop()}` : null
  const bannerSrc = product.bannerImage ? `/api/images/products/${product.bannerImage.split('/').pop()}` : null

  const estimatedDelivery = 'Instant (after payment)'
  const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock'

  // Dynamic availability message
  const getAvailabilityMessage = () => {
    if (product.stock <= 0) return "OUT OF STOCK"
    if (!product.isLimited) return "Always available"
    if (!product.startDate && !product.endDate) return "Limited edition"
    const now = new Date()
    if (product.startDate && now < new Date(product.startDate)) return "Coming soon"
    if (!product.endDate) return "Limited time offer"
    const end = new Date(product.endDate)
    if (now > end) return "Expired"
    const diffHours = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60))
    if (diffHours < 24) return `Available for ${diffHours} more hours`
    const days = Math.ceil(diffHours / 24)
    return `Available for ${days} more days`
  }

  const availabilityMessage = getAvailabilityMessage()
  const isOutOfStock = product.stock <= 0

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="fixed inset-0 z-0">
          <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-pink-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Back button - fixed clickability */}
        <Link 
          href="/products" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group z-20 relative"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Products</span>
        </Link>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.4)]">
          {/* Banner Image */}
          {bannerSrc && (
            <div className="relative w-full h-48 md:h-56 overflow-hidden">
              <img src={bannerSrc} alt="Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                {/* No rating number */}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row">
            {/* Left Column – Image */}
            <div className="md:w-2/5 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10">
              <div className="w-full aspect-square max-w-[400px] relative rounded-xl overflow-hidden bg-black/30 border border-white/10">
                {imageSrc ? (
                  <img src={imageSrc} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500" />
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Secure
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Instant
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Fast Delivery
                </span>
              </div>
            </div>

            {/* Right Column – Product Details */}
            <div className="md:w-3/5 p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold">{product.name}</h1>
                  <p className="text-sm text-gray-400 mt-1">
                    Category: <span className="text-purple-400">{product.category?.name || 'Uncategorized'}</span>
                  </p>
                </div>
                {product.isLimited && !isOutOfStock && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-3 h-3" /> Limited Edition
                  </span>
                )}
                {isOutOfStock && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-3 h-3" /> Out of Stock
                  </span>
                )}
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-6">{product.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-400">Price</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ${product.price.toFixed(2)} USDC
                  </p>
                  {product.discount && (
                    <p className="text-xs text-green-400">🔥 {product.discount}% discount applied</p>
                  )}
                </div>
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-400">Stock Status</p>
                  <p className="text-lg font-medium flex items-center gap-2">
                    {!isOutOfStock ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={!isOutOfStock ? 'text-emerald-400' : 'text-red-400'}>
                      {stockStatus}
                    </span>
                  </p>
                </div>
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-400">Estimated Delivery</p>
                  <p className="text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-400" />
                    <span>{estimatedDelivery}</span>
                  </p>
                </div>
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-400">Availability</p>
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    <span className={availabilityMessage === "OUT OF STOCK" ? "text-red-400 font-bold" : (availabilityMessage.includes("Expired") ? "text-red-400" : "text-emerald-400")}>
                      {availabilityMessage}
                    </span>
                  </p>
                </div>
              </div>

              <Link
                href={!isOutOfStock ? `/checkout/${product.id}` : '#'}
                className={`block w-full py-4 rounded-xl text-white font-bold text-center transition-all ${
                  !isOutOfStock 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-[1.02]' 
                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                }`}
              >
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
