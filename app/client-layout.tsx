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
  const lastPageview = useRef<{ path: string; at: number } | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    // ✅ Add all public routes here
    const publicPages = [
      '/',
      '/products',
      '/about',
      '/faq',
      '/contact',
      '/login',
      '/register',
      '/privacy',
      '/terms',
      '/forgot-password',
      '/reset-password'      // allows any /reset-password/* subpath
    ]

    const isPublicPage = publicPages.some(page => 
      pathname === page || pathname.startsWith(page + '/')
    )

    const isApiRoute = pathname.startsWith('/api')
    const isAuthRoute = pathname.startsWith('/api/auth')

    if (isPublicPage || isApiRoute || isAuthRoute) {
      redirectExecuted.current = false
      return
    }

    if (status === 'authenticated') {
      redirectExecuted.current = false
      return
    }

    if (status === 'unauthenticated' && !redirectExecuted.current) {
      redirectExecuted.current = true
      router.push('/login')
    }
  }, [status, pathname, router])

  // Client-side pageview tracking (more reliable than middleware-only edge fetch)
  useEffect(() => {
    if (!pathname || pathname.startsWith('/accessadmin') || pathname.startsWith('/api')) return

    const now = Date.now()
    if (lastPageview.current?.path === pathname && now - lastPageview.current.at < 2500) return
    lastPageview.current = { path: pathname, at: now }

    const sessionId = document.cookie
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('sessionId='))
      ?.split('=')[1]

    fetch('/api/analytics/pageview', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        path: pathname,
        method: 'GET',
        userAgent: navigator.userAgent,
        referer: document.referrer || '',
        query: typeof window !== 'undefined' ? window.location.search : '',
        sessionId: sessionId ? decodeURIComponent(sessionId) : crypto.randomUUID(),
      }),
    }).catch(() => {})
  }, [pathname])

  const hideLiveChat = pathname?.startsWith('/accessadmin')

  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col">
        <div className="flex-grow">{children}</div>
      </main>
      <Footer />
      {!hideLiveChat && <LiveChatWidget />}
    </>
  )
}
