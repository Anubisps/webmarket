import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { deleteLiveChatSessionFiles } from '@/lib/livechatFiles'

async function requireStaff() {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || !['admin', 'manager', 'support'].includes(user.role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await requireStaff()
    if (auth.error) return auth.error

    const chatSession = await prisma.liveChatSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    await prisma.liveChatMessage.updateMany({
      where: {
        sessionId: id,
        sender: 'visitor',
        isRead: false
      },
      data: { isRead: true }
    })

    return NextResponse.json(chatSession)
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await requireStaff()
    if (auth.error) return auth.error

    // Delete the session (will cascade delete messages)
    await prisma.liveChatSession.delete({
      where: { id }
    })

    await deleteLiveChatSessionFiles(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
