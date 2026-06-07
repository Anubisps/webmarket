import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import GeneralSettingsUI from './GeneralSettingsUI'

export default async function GeneralSettingsPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || !['admin', 'manager'].includes(user.role)) {
    redirect('/dashboard')
  }

  const settings = await prisma.siteSetting.findMany({
    orderBy: { category: 'asc' }
  })

  return <GeneralSettingsUI initialSettings={settings} />
}
