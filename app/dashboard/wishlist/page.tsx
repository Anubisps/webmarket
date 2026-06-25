'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Trash2, Box } from 'lucide-react'
import { productImageUrl } from '@/lib/productImage'

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const res = await fetch('/api/wishlist')
        const data = await res.json()
        setItems(data)
      } catch (err) {
        console.error('Failed to load wishlist:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchWishlist()
  }, [])

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/wishlist`, {
        method: 'POST'
      })
      if (res.ok) {
        setItems(items.filter(item => item.productId !== productId))
      }
    } catch (err) {
      console.error('Failed to remove from wishlist:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            My Wishlist
          </h1>
          <div className="text-center py-12 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
            <Box className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Your wishlist is empty.</p>
            <Link href="/products" className="mt-3 inline-block px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-current" />
          My Wishlist ({items.length})
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => {
            const firstImage = item.product?.images?.[0]
            const imageSrc = productImageUrl(firstImage)
            return (
              <div
                key={item.id}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all"
              >
                <Link href={`/products/${item.product.slug}`}>
                  <div className="h-32 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 relative">
                    {imageSrc ? (
                      <img src={imageSrc} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500" />
                    )}
                  </div>
                </Link>
                <div className="p-2.5">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="text-sm font-medium truncate hover:text-purple-400 transition-colors">
                      {item.product.name}
                    </h3>
                    <p className="text-sm font-bold text-purple-400">
                      ${item.product.price.toFixed(2)}
                    </p>
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="mt-1 w-full py-1 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
