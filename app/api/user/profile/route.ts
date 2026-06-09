import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Check if email is already taken by someone else
    const existing = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: session.user.id }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Update the database record
    await prisma.user.update({
      where: { id: session.user.id },
      data: { email }
    })

    // ✅ Return a clean confirmation to the client application
    return NextResponse.json({ 
      success: true, 
      message: 'Email updated successfully' 
    }, { status: 200 })

  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
