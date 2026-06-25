import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { sendPayoutStatusEmail } from '@/lib/email'
import { sendDiscordNotification } from '@/lib/events/discord'
import { writeAuditLog } from '@/lib/auditLog'
import { requireCsrf } from '@/lib/security/requireCsrf'
import type { NextRequest } from 'next/server'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (['admin', 'manager'].includes(user.role)) {
    const requests = await prisma.affiliatePayoutRequest.findMany({
      include: { affiliate: { include: { user: { select: { username: true, email: true } } } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(requests)
  }

  const affiliate = await prisma.affiliate.findUnique({ where: { userId: user.id } })
  if (!affiliate) return NextResponse.json([])
  const requests = await prisma.affiliatePayoutRequest.findMany({
    where: { affiliateId: affiliate.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(requests)
}

export async function POST(request: Request) {
  try {
    const req = request as unknown as NextRequest
    const csrfError = await requireCsrf(req)
    if (csrfError) return csrfError

    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const affiliate = await prisma.affiliate.findUnique({ where: { userId: user.id } })
    if (!affiliate) return NextResponse.json({ error: 'Not an affiliate' }, { status: 400 })

    const { amount, note } = await request.json()
    const payoutAmount = parseFloat(amount)
    if (!payoutAmount || payoutAmount <= 0 || payoutAmount > affiliate.balance) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const payout = await prisma.affiliatePayoutRequest.create({
      data: { affiliateId: affiliate.id, amount: payoutAmount, note: note || null },
    })

    await sendDiscordNotification('affiliate.payout', {
      title: 'Payout requested',
      description: `${user.username} requested ${payoutAmount.toFixed(2)} USD`,
    })

    return NextResponse.json(payout)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const req = request as unknown as NextRequest
    const csrfError = await requireCsrf(req)
    if (csrfError) return csrfError

    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const admin = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!admin || !['admin', 'manager'].includes(admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id, status, adminNote } = await request.json()
    const payout = await prisma.affiliatePayoutRequest.findUnique({
      where: { id },
      include: { affiliate: { include: { user: true } } },
    })
    if (!payout) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (status === 'approved' && payout.status === 'pending') {
      if (payout.affiliate.balance < payout.amount) {
        return NextResponse.json({ error: 'Insufficient affiliate balance' }, { status: 400 })
      }
      await prisma.affiliate.update({
        where: { id: payout.affiliateId },
        data: { balance: { decrement: payout.amount } },
      })
    }

    const updated = await prisma.affiliatePayoutRequest.update({
      where: { id },
      data: { status, adminNote: adminNote || null },
    })

    await sendPayoutStatusEmail(payout.affiliate.user, payout.amount, status)
    await writeAuditLog({
      userId: admin.id,
      actorEmail: admin.email,
      action: `affiliate.payout.${status}`,
      entity: 'affiliate_payout',
      entityId: id,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
