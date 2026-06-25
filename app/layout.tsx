import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { SettingsProvider } from '@/context/SettingsContext'
import { ClientLayout } from './client-layout'

export const metadata: Metadata = {
  title: 'WindVault Market',
  description: '3rd-party gaming marketplace – secure & encrypted',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WindVault',
  },
}

export const viewport: Viewport = {
  themeColor: '#6d28d9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
            <ClientLayout>{children}</ClientLayout>
          </SettingsProvider>
        </Providers>
      </body>
    </html>
  )
}
