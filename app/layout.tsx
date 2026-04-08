import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Vanguard | Security Platform',
  description: 'Advanced cybersecurity SaaS platform with document verification, SOAR terminal, and compliance monitoring',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/vanguardlogo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/vanguardlogo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/vanguardlogo.png',
        type: 'image/png',
      },
    ],
    apple: '/vanguardlogo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
