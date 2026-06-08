'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // NextAuth redirects here after signout
    // Then we redirect to home page after a brief delay
    const timer = setTimeout(() => {
      router.push('/')
    }, 500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Logging Out...</h1>
        <p className="text-gray-600 dark:text-gray-400">Redirecting you home.</p>
      </div>
    </div>
  )
}
