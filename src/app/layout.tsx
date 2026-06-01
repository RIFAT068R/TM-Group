import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | TM Business Hub',
    default: 'TM Business Hub — Titas Enterprise & TM Overseas',
  },
  description:
    'Unified AI-powered business intelligence platform for Titas Enterprise (Chemical Import) and TM Overseas (Manpower Management).',
  keywords: ['chemical import', 'manpower', 'business intelligence', 'ERP', 'Bangladesh'],
  authors: [{ name: 'TM Business Hub' }],
  robots: 'noindex, nofollow', // Private internal tool
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#07101F',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
