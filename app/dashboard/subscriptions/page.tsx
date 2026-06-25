'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Calendar, RefreshCw, Loader2 } from 'lucide-react'
import { formatPriceLabel } from '@/lib/formatPrice'
import { csrfHeaders } from '@/lib/csrfClient'

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch('/api/subscriptions')
      .then(r => r.json())
      .then(setSubs)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const renew = async (sub: any) => {
    window.location.href = `/checkout/${sub.productId}?subscriptionId=${sub.id}`
  }

  const cancel = async (id: string) => {
    const res = await fetch('/api/subscriptions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
      body: JSON.stringify({ id, status: 'cancelled' }),
    })
    if (res.ok) {
      toast.success('Subscription cancelled')
      load()
    } else toast.error('Failed to cancel')
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">My Subscriptions</h1>
      {subs.length === 0 ? (
        <p className="text-gray-400">No active subscriptions. Subscriptions are created when you purchase a product with recurring billing enabled.</p>
      ) : (
        <div className="space-y-4">
          {subs.map(sub => (
            <div key={sub.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-bold">{sub.product?.name}</p>
                  <p className="text-sm text-gray-400">
                    Every {sub.intervalDays} days · {formatPriceLabel(sub.price)} · Next due {new Date(sub.nextDueDate).toLocaleDateString()}
                  </p>
                  <p className={`mt-1 text-xs capitalize ${sub.status === 'active' ? 'text-emerald-400' : 'text-gray-500'}`}>{sub.status}</p>
                </div>
                <div className="flex gap-2">
                  {sub.status === 'active' && (
                    <>
                      <button onClick={() => renew(sub)} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium">
                        Pay renewal
                      </button>
                      <button onClick={() => cancel(sub.id)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-400">
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
