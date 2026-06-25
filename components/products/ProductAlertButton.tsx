'use client'

import { useState } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function ProductAlertButton({ productId, outOfStock }: { productId: string; outOfStock: boolean }) {
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  if (!outOfStock) return null

  const toggle = async () => {
    setLoading(true)
    try {
      if (subscribed) {
        await fetch('/api/product-alerts', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        setSubscribed(false)
        toast.success('Alert removed')
      } else {
        const res = await fetch('/api/product-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        if (res.ok) {
          setSubscribed(true)
          toast.success('We will notify you when this is back in stock')
        } else toast.error('Could not create alert — try logging in')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-200 hover:bg-amber-500/20 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : subscribed ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      {subscribed ? 'Alert active — click to remove' : 'Notify me when back in stock'}
    </button>
  )
}
