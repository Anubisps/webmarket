'use client'
import Link from 'next/link'
import { ChevronRight, Home, MessageSquare } from 'lucide-react'

type TicketShellProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export function TicketShell({ title, subtitle, children, actions }: TicketShellProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-violet-500 selection:text-white py-10 md:py-12">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] h-[65%] w-[65%] rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-[-25%] right-[-15%] h-[65%] w-[65%] rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute top-[40%] left-[35%] h-[30%] w-[30%] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-5xl px-4">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-400">
          <Link href="/dashboard" className="inline-flex items-center gap-1 transition hover:text-white">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-600" />
          <Link href="/dashboard/tickets" className="inline-flex items-center gap-1 transition hover:text-white">
            <MessageSquare className="h-4 w-4" />
            Support
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-600" />
          <span className="text-violet-300">{title}</span>
        </nav>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold md:text-4xl">
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
            {subtitle && <p className="mt-2 text-lg text-gray-400">{subtitle}</p>}
          </div>
          {actions}
        </div>

        {children}
      </div>
    </div>
  )
}
