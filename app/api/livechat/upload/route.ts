import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'
import { getLiveChatUploadDir, isAllowedLiveChatFile, getLiveChatFileUrl } from '@/lib/livechatFiles'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const sessionId = formData.get('sessionId') as string
    const sender = formData.get('sender') as string
    const file = formData.get('file') as File | null
    const caption = (formData.get('message') as string | null)?.trim() || ''

    if (!sessionId || !sender || !file) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (!['visitor', 'admin'].includes(sender)) {
      return NextResponse.json({ error: 'Invalid sender' }, { status: 400 })
    }

    if (!isAllowedLiveChatFile(file)) {
      return NextResponse.json({ error: 'Only images and PDF files are allowed' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File must be 10MB or smaller' }, { status: 400 })
    }

    const chatSession = await prisma.liveChatSession.findUnique({
      where: { id: sessionId }
    })

    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (chatSession.status !== 'active') {
      return NextResponse.json({ error: 'Chat session is closed' }, { status: 400 })
    }

    const uploadDir = getLiveChatUploadDir(sessionId)
    await mkdir(uploadDir, { recursive: true })

    const ext = path.extname(file.name) || (file.type === 'application/pdf' ? '.pdf' : '.png')
    const uniqueName = `${randomBytes(16).toString('hex')}${ext}`
    const filePath = path.join(uploadDir, uniqueName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const attachmentUrl = getLiveChatFileUrl(sessionId, uniqueName)

    const newMessage = await prisma.liveChatMessage.create({
      data: {
        sessionId,
        sender,
        message: caption,
        attachmentUrl,
        attachmentName: file.name,
        attachmentMime: file.type || 'application/octet-stream',
        isRead: sender === 'admin'
      }
    })

    await prisma.liveChatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('Live chat upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
