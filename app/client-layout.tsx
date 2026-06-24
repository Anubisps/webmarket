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

  useEffect(() => {
    if (status === 'loading') return

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
      '/reset-password'
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
