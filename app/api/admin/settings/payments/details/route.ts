import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id, instructions, walletAddress, mode, config, testMode } = await request.json()

    const data: Record<string, unknown> = {}
    if (instructions !== undefined) data.instructions = instructions
    if (walletAddress !== undefined) data.walletAddress = walletAddress
    if (mode !== undefined) data.mode = mode === 'auto' ? 'auto' : 'manual'
    if (config !== undefined) data.config = config
    if (testMode !== undefined) data.testMode = !!testMode

    await prisma.paymentSetting.update({ where: { id }, data })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
