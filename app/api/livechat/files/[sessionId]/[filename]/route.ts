import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db'
import { getLiveChatUploadDir } from '@/lib/livechatFiles'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'])
const PDF_EXTENSIONS = new Set(['.pdf'])

function getContentType(ext: string): string {
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    case '.bmp':
      return 'image/bmp'
    case '.svg':
      return 'image/svg+xml'
    case '.pdf':
      return 'application/pdf'
    default:
      return 'application/octet-stream'
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; filename: string }> }
) {
  try {
    const { sessionId, filename } = await params

    if (
      !sessionId ||
      !filename ||
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    const ext = path.extname(filename).toLowerCase()
    if (!IMAGE_EXTENSIONS.has(ext) && !PDF_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    const chatSession = await prisma.liveChatSession.findUnique({
      where: { id: sessionId }
    })

    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const filePath = path.join(getLiveChatUploadDir(sessionId), filename)
    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': getContentType(ext),
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Live chat file serving error:', error)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
