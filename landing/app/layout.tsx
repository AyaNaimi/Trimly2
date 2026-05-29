import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/context/language-context'
import Navigation from '@/components/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trimly - Budget Smart, Live Better',
  description: 'Master your finances with intelligent budget tracking, subscription management, and email-based financial discovery.',
  openGraph: {
    title: 'Trimly - Budget Smart, Live Better',
    description: 'Master your finances with intelligent budget tracking, subscription management, and email-based financial discovery.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <Navigation />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
