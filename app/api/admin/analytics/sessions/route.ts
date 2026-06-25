import { NextResponse } from 'next/server'

/** @deprecated Use GET /api/admin/analytics/dashboard instead */
export async function GET(request: Request) {
  const url = new URL('/api/admin/analytics/dashboard', request.url)
  const res = await fetch(url, { headers: request.headers })
  const data = await res.json()
  return NextResponse.json({ activeSessions: data.live?.activeSessions || [], closedSessions: [] }, { status: res.status })
}
