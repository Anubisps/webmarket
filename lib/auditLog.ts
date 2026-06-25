import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export async function writeAuditLog(params: {
  userId?: string | null
  actorEmail?: string | null
  action: string
  entity: string
  entityId?: string | null
  details?: Prisma.InputJsonValue | null
  ip?: string | null
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        actorEmail: params.actorEmail || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: params.details ?? undefined,
        ip: params.ip || null,
      },
    })
  } catch (err) {
    console.error('Audit log error:', err)
  }
}
