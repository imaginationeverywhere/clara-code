import type { Metadata } from 'next'
import './globals.css'

// Required for Cloudflare Pages via @cloudflare/next-on-pages
// next/font/google causes edge Worker crashes — Inter is loaded via globals.css @import
export const runtime = 'edge'

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
      <body className="font-sans bg-[#0F0F0F] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
