import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { writeFile, mkdir, unlink } from 'fs/promises'
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

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the current product to find the old banner image
    const currentProduct = await prisma.product.findUnique({
      where: { id }
    })

    // If there is an old banner image, delete it from the filesystem
    if (currentProduct?.bannerImage) {
      const oldFilePath = path.join(process.cwd(), 'public', currentProduct.bannerImage)
      try {
        await unlink(oldFilePath)
      } catch (err) {
        // Ignore if the file doesn't exist
      }
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    await mkdir(uploadDir, { recursive: true })

    const ext = path.extname(file.name)
    const uniqueName = `banner_${randomBytes(16).toString('hex')}${ext}`
    const filePath = path.join(uploadDir, uniqueName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const bannerUrl = `/uploads/products/${uniqueName}`

    const product = await prisma.product.update({
      where: { id },
      data: { bannerImage: bannerUrl }
    })

    return NextResponse.json({ success: true, bannerImage: product.bannerImage })
  } catch (error) {
    console.error('Banner upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
