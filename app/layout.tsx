import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { SettingsProvider } from '@/context/SettingsContext'
import { ClientLayout } from './client-layout'

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
            <ClientLayout>{children}</ClientLayout>
          </SettingsProvider>
        </Providers>
      </body>
    </html>
  )
}
