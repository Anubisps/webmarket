import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { readFile } from 'fs/promises'
import path from 'path'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Optional: Verify the user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', 'profiles', filename)

    // Read the file
    const fileBuffer = await readFile(filePath)

    // Determine the content type
    const ext = path.extname(filename).toLowerCase()
    const contentType =
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      ext === '.png' ? 'image/png' :
      ext === '.webp' ? 'image/webp' :
      ext === '.gif' ? 'image/gif' : 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('Image serving error:', error)
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }
}
