import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Bell } from 'lucide-react'
import { NotificationInbox } from './NotificationInbox'

export default async function NotificationsPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 mb-4">
            <Bell className="h-4 w-4 text-violet-400" />
            <span className="text-xs text-gray-300">Notifications</span>
          </div>
          <h1 className="text-3xl font-extrabold">In-app notifications</h1>
          <p className="text-gray-400 mt-2">Order updates, refunds, subscriptions, and support replies.</p>
        </div>
        <NotificationInbox />
      </div>
    </div>
  )
}
