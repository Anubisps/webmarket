import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await prisma.userPreference.findUnique({
      where: { userId: session.user.id }
    })

    // If no preferences exist, return defaults
    if (!preferences) {
      return NextResponse.json({
        emailNotifications: true,
        orderUpdates: true
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { emailNotifications, orderUpdates } = await request.json()

    // Upsert: create if doesn't exist, update if it does
    const preferences = await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: {
        emailNotifications,
        orderUpdates
      },
      create: {
        userId: session.user.id,
        emailNotifications,
        orderUpdates
      }
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
