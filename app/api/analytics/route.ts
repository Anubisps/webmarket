import { NextResponse } from 'next/server'

/** @deprecated Client-side event tracking removed — pageviews tracked via middleware */
export async function POST() {
  return NextResponse.json({ success: true, deprecated: true })
}
