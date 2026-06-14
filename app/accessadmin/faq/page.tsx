import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { HelpCircle, Plus, Edit, Trash2, Sparkles, Box, ArrowUp, ArrowDown } from 'lucide-react'
import { FaqList } from './FaqList'

export default async function AdminFaqPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || !['admin', 'manager'].includes(user.role)) {
    redirect('/dashboard')
  }

  const faqs = await prisma.faq.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300">FAQ Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Manage <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">FAQs</span>
          </h1>
          <p className="text-gray-400 text-lg">Create, edit and organize frequently asked questions.</p>
        </div>
        <Link
          href="/accessadmin/faq/new"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all mt-4 md:mt-0"
        >
          <Plus className="w-4 h-4" />
          Add New FAQ
        </Link>
      </div>

      <FaqList initialFaqs={faqs} />
    </div>
  )
}
