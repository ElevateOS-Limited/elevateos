import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { getSessionOrDemo } from '@/lib/auth/session'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://elevateos.org'),
  title: 'ElevateOS | Dashboard, Tutoring, and Counselling',
  description: 'ElevateOS dashboard, onboarding, tutoring MVP, and annual counselling workspace for students and families.',
  applicationName: 'ElevateOS',
  authors: [{ name: 'Howard' }],
  creator: 'Howard',
  publisher: 'Howard',
  robots: {
    index: true,
    follow: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/elevateos-logo.png',
  },
  verification: {
    other: { 'ip-provenance': 'HOWARD-APPDEMO-20260222' },
  },
}

export default async function RootLayout({
  children,
  auth,
}: {
  children: React.ReactNode
  auth: React.ReactNode
}) {
  const session = await getSessionOrDemo()

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Providers session={session}>
          {children}
          {auth}
        </Providers>
      </body>
    </html>
  )
}
