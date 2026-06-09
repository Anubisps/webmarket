'use client'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LiveChatWidget } from '@/components/chat/LiveChatWidget'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()
  const redirectExecuted = useRef(false)
  const lastCheckedPath = useRef('')

  useEffect(() => {
    // 1. Skip completely if NextAuth is resolving or updating session tokens
    if (status === 'loading') return

    // 2. Define public routes that never require a login barrier
    const publicPages = [
      '/',
      '/products',
      '/about',
      '/faq',
      '/contact',
      '/login',
      '/register'
    ]

    const isPublicPage = publicPages.some(page => 
      pathname === page || pathname.startsWith(page + '/')
    )

    const isApiRoute = pathname.startsWith('/api')
    const isAuthRoute = pathname.startsWith('/api/auth')

    // If it's a public area or backend endpoint, reset tracking flags and stop
    if (isPublicPage || isApiRoute || isAuthRoute) {
      redirectExecuted.current = false
      return
    }

    // 3. Break out early if authenticated to prevent loops
    if (status === 'authenticated') {
      redirectExecuted.current = false
      return
    }

    // 4. Prevent duplicate trigger cycles on the exact same unauthenticated route
    if (status === 'unauthenticated' && !redirectExecuted.current) {
      redirectExecuted.current = true
      router.push('/login')
    }
  }, [status, pathname]) // 👈 CRITICAL: Removed 'router' from dependencies to halt the request spam!

  return (
    <>
      <LiveChatWidget />
      <Header />
      <main className="min-h-screen flex flex-col">
        <div className="flex-grow">{children}</div>
      </main>
      <Footer />
    </>
  )
}
