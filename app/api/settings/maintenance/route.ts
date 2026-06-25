import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'maintenance_mode' },
      select: { value: true },
    })
    const maintenance = setting?.value === 'true' || process.env.MAINTENANCE_MODE === 'true'
    return NextResponse.json(
      { maintenance },
      { headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' } }
    )
  } catch {
    return NextResponse.json({ maintenance: process.env.MAINTENANCE_MODE === 'true' })
  }
}
