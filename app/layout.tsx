import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ServiceWorkerRegistrar } from '@/components/push/ServiceWorkerRegistrar'

export const metadata: Metadata = {
  title: 'Sports NextUp',
  description: 'Pick-up games, scores, and news for sports fans',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider>
          <ServiceWorkerRegistrar />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
