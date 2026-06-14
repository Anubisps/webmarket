import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
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

    const { question, answer, isActive } = await req.json()
    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 })
    }

    const lastFaq = await prisma.faq.findFirst({
      orderBy: { order: 'desc' }
    })

    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
        isActive: isActive !== undefined ? isActive : true,
        order: (lastFaq?.order ?? 0) + 1
      }
    })

    return NextResponse.json(faq)
  } catch (error) {
    console.error('Create FAQ error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(faqs)
  } catch (error) {
    console.error('Get FAQs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
