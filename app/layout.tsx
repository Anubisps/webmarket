import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Providers } from './providers'
import { SettingsProvider } from '@/context/SettingsContext'
import { getServerSession } from 'next-auth'

export const metadata: Metadata = {
  title: 'WindVault Market',
  description: '3rd-party gaming marketplace - secure & encrypted',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'manager'
  const isAdminRoute = false // We'll handle this differently

  return (
    <html lang="en">
      <body>
        <Providers>
          <SettingsProvider>
            {isAdminRoute ? (
              children
            ) : (
              <>
                <Header />
                {children}
                <Footer />
              </>
            )}
          </SettingsProvider>
        </Providers>
      </body>
    </html>
  )
}
