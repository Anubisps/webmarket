import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany()
    const formatted: Record<string, any> = {}
    
    for (const s of settings) {
      let value: any = s.value
      if (s.type === 'boolean') {
        value = value === 'true'
      } else if (s.type === 'number') {
        value = Number(value)
      }
      formatted[s.key] = value
    }
    
    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
