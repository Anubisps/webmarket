import Link from 'next/link'
import { Star, ArrowRight, Flame, Eye } from 'lucide-react'
import { WishlistButton } from './WishlistButton'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    stock: number
    images: string[]
    category: { name: string } | null
  }
  imageSrc: string | null
  wishlisted: boolean
}

export function ProductCard({ product, imageSrc, wishlisted }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0

  return (
    <div className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-purple-500/50 hover:-translate-y-2 transition-all duration-500">
      {/* Image Section */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden">
        <div className="aspect-square relative">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 transition-transform duration-700 group-hover:scale-110" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.category?.name && (
            <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
              {product.category.name}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton productId={product.id} initialWishlisted={wishlisted} />
        </div>
        {isOutOfStock && (
          <div className="absolute bottom-3 left-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg text-center">
            OUT OF STOCK
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-base font-bold mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">USDC</span>
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center gap-1 text-sm font-medium text-purple-400 group-hover:gap-2 transition-all"
          >
            View <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
