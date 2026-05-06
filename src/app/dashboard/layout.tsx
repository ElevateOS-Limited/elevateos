import { headers } from 'next/headers'
import DashboardShell from '@/components/layout/DashboardShell'
import { buildDemoUser } from '@/lib/auth/demo'
import { getSessionOrDemo } from '@/lib/auth/session'
import { getSiteVariantFromHeaders } from '@/lib/site'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionOrDemo()
  const headerStore = await headers()
  const siteVariant = getSiteVariantFromHeaders(headerStore)

  return <DashboardShell user={session?.user ?? buildDemoUser()} siteVariant={siteVariant}>{children}</DashboardShell>
}
