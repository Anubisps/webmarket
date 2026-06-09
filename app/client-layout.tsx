'use client'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header' // ✅ Named import
import { Footer } from '@/components/layout/Footer' // ✅ Named import
import { LiveChatWidget } from '@/components/chat/LiveChatWidget'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // ✅ Prevent redirect loops by checking if we're already on login or API routes
  useEffect(() => {
    if (status === 'loading') return // Wait for session to load
    
    const isLoginPage = pathname === '/login'
    const isRegisterPage = pathname === '/register'
    const isApiRoute = pathname.startsWith('/api')
    const isAdminRoute = pathname.startsWith('/accessadmin')
    
    // ✅ Don't redirect if we're already on login/register or API routes
    if (isLoginPage || isRegisterPage || isApiRoute) return

    if (status === 'unauthenticated' && !isRedirecting) {
      setIsRedirecting(true)
      router.push('/login')
    }

    if (status === 'authenticated' && isRedirecting) {
      setIsRedirecting(false)
    }
  }, [status, pathname, router, isRedirecting])

  return (
    <>
      <LiveChatWidget />
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
