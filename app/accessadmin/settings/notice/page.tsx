import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import NoticeSettingsForm from './NoticeSettingsForm';

export default async function NoticeSettingsPage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect('/login');
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !['admin', 'manager'].includes(user.role)) redirect('/dashboard');

  const activeSetting = await prisma.siteSetting.findUnique({ where: { key: 'notice_active' } });
  const messageSetting = await prisma.siteSetting.findUnique({ where: { key: 'notice_message' } });
  const styleSetting = await prisma.siteSetting.findUnique({ where: { key: 'notice_style' } });

  const isActive = activeSetting?.value === 'true';
  const message = messageSetting?.value || '';
  const style = styleSetting?.value || 'purple';

  return (
    <NoticeSettingsForm 
      initialIsActive={isActive} 
      initialMessage={message} 
      initialStyle={style} 
    />
  );
}
