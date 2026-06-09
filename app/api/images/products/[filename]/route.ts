import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    // Allowed extensions
    const ext = path.extname(filename).toLowerCase()
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', 'products', filename)

    // Read the file
    const fileBuffer = await readFile(filePath)

    // Determine content type
    const contentType =
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      ext === '.png' ? 'image/png' :
      ext === '.webp' ? 'image/webp' :
      ext === '.gif' ? 'image/gif' :
      ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('Product image serving error:', error)
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }
}
