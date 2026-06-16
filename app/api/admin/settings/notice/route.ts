import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { isActive, message, style } = await req.json();

    // Save active flag
    await prisma.siteSetting.upsert({
      where: { key: 'notice_active' },
      update: { value: isActive ? 'true' : 'false' },
      create: { key: 'notice_active', value: isActive ? 'true' : 'false', label: 'Notice Active', type: 'boolean', category: 'general' }
    });

    // Save message
    await prisma.siteSetting.upsert({
      where: { key: 'notice_message' },
      update: { value: message },
      create: { key: 'notice_message', value: message, label: 'Notice Message', type: 'textarea', category: 'general' }
    });

    // Save style
    await prisma.siteSetting.upsert({
      where: { key: 'notice_style' },
      update: { value: style || 'purple' },
      create: { key: 'notice_style', value: style || 'purple', label: 'Notice Style', type: 'text', category: 'general' }
    });

    revalidatePath('/products');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
