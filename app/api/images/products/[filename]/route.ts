import { NextResponse } from 'next/server'
import { readFile, access } from 'fs/promises'
import path from 'path'
import { constants } from 'fs'

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

async function tryReadFile(filePath: string) {
  try {
    await access(filePath, constants.R_OK)
    return await readFile(filePath)
  } catch {
    return null
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const ext = path.extname(filename).toLowerCase()
    if (!CONTENT_TYPES[ext]) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    const candidates = [
      path.join(process.cwd(), 'public', 'uploads', 'products', filename),
      path.join(process.cwd(), 'uploads', 'products', filename),
    ]

    let fileBuffer: Buffer | null = null
    for (const candidate of candidates) {
      fileBuffer = await tryReadFile(candidate)
      if (fileBuffer) break
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': CONTENT_TYPES[ext],
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('Product image serving error:', error)
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }
}
