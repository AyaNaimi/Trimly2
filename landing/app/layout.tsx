import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Trimly - Take Control of Your Subscriptions',
  description: 'Automatically discover, track, and manage all your subscriptions. Save thousands annually with smart recommendations.',
  openGraph: {
    title: 'Trimly - Take Control of Your Subscriptions',
    description: 'Automatically discover, track, and manage all your subscriptions. Save thousands annually with smart recommendations.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning style={{ colorScheme: 'light dark' }}>
      <body className={`${inter.className} ${playfair.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
