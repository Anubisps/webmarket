'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function WishlistButton({ productId, initialWishlisted }: { productId: string; initialWishlisted: boolean }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [loading, setLoading] = useState(false)

  const toggleWishlist = async () => {
    if (!session) {
      router.push('/login')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${productId}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (res.ok) {
        setWishlisted(data.wishlisted)
      }
    } catch (err) {
      console.error('Wishlist error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
    >
      <Heart
        className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`}
      />
    </button>
  )
}
