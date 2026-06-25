'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

type NotificationItem = {
  id: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export function NotificationInbox() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/user/notifications/inbox', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setItems(data.notifications ?? [])
        setUnread(data.unread ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const markAllRead = async () => {
    await fetch('/api/user/notifications/inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    toast.success('All notifications marked read')
    load()
  }

  const markRead = async (id: string) => {
    await fetch('/api/user/notifications/inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{unread} unread</p>
        {unread > 0 && (
          <button onClick={markAllRead} className="inline-flex items-center gap-2 text-sm text-violet-300 hover:text-white">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center text-gray-500">
          <Bell className="mx-auto mb-3 h-8 w-8 opacity-50" />
          No notifications yet. Order updates and support replies will appear here.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(n => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 ${n.isRead ? 'border-white/5 bg-black/20' : 'border-violet-500/30 bg-violet-500/10'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-600 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {n.link && (
                    <Link href={n.link} onClick={() => markRead(n.id)} className="text-xs text-violet-300 hover:underline">
                      View
                    </Link>
                  )}
                  {!n.isRead && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-gray-500 hover:text-white">
                      Mark read
                    </button>
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
