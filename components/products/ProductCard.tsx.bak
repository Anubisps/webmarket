import Link from 'next/link'
import { Star } from 'lucide-react'
import { WishlistButton } from './WishlistButton'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    stock: number
    images: string[]
    category: {
      name: string
    } | null
  }
  imageSrc: string | null
  wishlisted: boolean
}

export function ProductCard({ product, imageSrc, wishlisted }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] transition-all duration-300"
    >
      <div className="relative h-32 sm:h-40 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500">
        {imageSrc ? (
          <img src={imageSrc} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500" />
        )}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-1.5 left-1.5">
          <span className="text-white text-[10px] font-medium px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
            {product.category?.name || 'Uncategorized'}
          </span>
        </div>
        <WishlistButton productId={product.id} initialWishlisted={wishlisted} />
        {isOutOfStock && (
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-red-500/80 backdrop-blur-sm rounded-full text-white text-[10px] font-bold">
            Out
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="text-sm font-medium mb-0.5 group-hover:text-purple-400 transition-colors truncate">
          {product.name}
        </h3>
        <p className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  )
}
