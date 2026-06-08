import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Providers } from './providers'
import { SettingsProvider } from '@/context/SettingsContext'

export const metadata: Metadata = {
  title: 'WindVault Market',
  description: '3rd-party gaming marketplace – secure & encrypted',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SettingsProvider>
            <Header />
            {children}
            <Footer />
          </SettingsProvider>
        </Providers>
      </body>
    </html>
  )
}
