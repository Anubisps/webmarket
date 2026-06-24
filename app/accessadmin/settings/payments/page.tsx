import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import PaymentSettingsUI from '../PaymentSettingsUI'

export default async function PaymentsSettingsPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || !['admin', 'manager'].includes(user.role)) redirect('/dashboard')

  const settings = await prisma.paymentSetting.findMany({ orderBy: { sortOrder: 'asc' } })

  return <PaymentSettingsUI initialSettings={settings as any} />
}
