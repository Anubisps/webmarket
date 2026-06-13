import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await prisma.page.findUnique({
    where: { slug }
  })

  if (!page) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      </div>
    </div>
  )
}
