'use client'

import { useEffect, useState } from 'react'

export function UnreadBadge({
  prefix,
  className = '',
}: {
  prefix?: string
  className?: string
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let active = true

    const loadCount = async () => {
      try {
        const query = prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''
        const res = await fetch(`/api/notifications/unread${query}`, {
          cache: 'no-store',
        })
        if (!res.ok) return
        const data = await res.json()
        if (active) setCount(data.count || 0)
      } catch {
        // Ignore polling errors
      }
    }

    loadCount()
    const interval = setInterval(loadCount, 15000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [prefix])

  if (count <= 0) return null

  return (
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white animate-pulse ${className}`}
    >
      {count > 9 ? '9+' : count}
    </span>
  )
}

export function useMarkNotificationsRead(link?: string) {
  useEffect(() => {
    if (!link) return

    fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ link }),
    }).catch(() => {})
  }, [link])
}
