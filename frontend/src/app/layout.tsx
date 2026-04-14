import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'
import { SignUpAnalytics } from '@/components/analytics/SignUpAnalytics'
import './globals.css'

const GA_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID

// next/font/google causes edge Worker crashes — Inter is loaded via globals.css @import
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
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="font-sans bg-bg-base text-white antialiased">
          {GA_ID ? (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
              />
              <Script id="ga4-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', { send_page_view: true });
                `}
              </Script>
            </>
          ) : null}
          <SignUpAnalytics />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
