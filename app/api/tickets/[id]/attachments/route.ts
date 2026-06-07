import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.status === 'closed') {
      return NextResponse.json({ error: 'Cannot attach files to closed ticket' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tickets')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const ext = path.extname(file.name)
    const uniqueName = `${randomBytes(16).toString('hex')}${ext}`
    const filePath = path.join(uploadDir, uniqueName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save attachment to database
    const attachment = await prisma.ticketAttachment.create({
      data: {
        ticketId: id,
        userId: user.id,
        filename: uniqueName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size
      }
    })

    const updatedTicket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        replies: {
          include: {
            user: {
              select: { username: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        attachments: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error('Attachment upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
