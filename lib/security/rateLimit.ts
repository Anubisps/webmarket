import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const store = new Map<string, { count: number; reset: number }>()

export function rateLimit(limit: number = 10, window: number = 60 * 1000) {
  return async (req: NextRequest) => {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    
    const now = Date.now()
    const record = store.get(ip) || { count: 0, reset: now + window }

    if (now > record.reset) {
      record.count = 0
      record.reset = now + window
    }

    record.count++
    store.set(ip, record)

    if (record.count > limit) {
      return NextResponse.json({
        error: 'Too many requests, please try again later'
      }, { status: 429 })
    }

    return null
  }
}
