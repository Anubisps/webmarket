import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || !['admin', 'manager'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)
  const entity = searchParams.get('entity')?.trim()
  const action = searchParams.get('action')?.trim()
  const actor = searchParams.get('actor')?.trim()

  const where: Prisma.AuditLogWhereInput = {}
  if (entity) where.entity = entity
  if (action) where.action = { contains: action, mode: 'insensitive' }
  if (actor) where.actorEmail = { contains: actor, mode: 'insensitive' }

  try {
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({
      logs: logs.map(log => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Audit log fetch error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const needsMigration = message.includes('AuditLog') || message.includes('does not exist')
    return NextResponse.json(
      {
        error: needsMigration
          ? 'AuditLog table missing — run: npx prisma db push && npx prisma generate'
          : 'Failed to load audit log',
        logs: [],
        total: 0,
      },
      { status: needsMigration ? 503 : 500 }
    )
  }
}
