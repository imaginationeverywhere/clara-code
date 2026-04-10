import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Required for Cloudflare Pages via @cloudflare/next-on-pages
export const runtime = 'edge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clara Code — Code with your voice',
  description: 'Voice-first AI coding assistant. Open source.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0F0F0F] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
