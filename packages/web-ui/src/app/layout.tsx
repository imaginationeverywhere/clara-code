import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Required for Cloudflare Pages via @cloudflare/next-on-pages
export const runtime = 'edge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clara Code — Code with your voice',
  description: 'Voice-first AI coding assistant. Open source.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/icon.png',
  },
  openGraph: {
    title: 'Clara Code — Code with your voice',
    description: 'Voice-first AI coding assistant. Open source.',
    images: [{ url: '/logo-hero.png', width: 1024, height: 1024 }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0D1117] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
