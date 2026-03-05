import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { getSessionOrDemo } from '@/lib/auth/session'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionOrDemo()
  if (!session) redirect('/auth/login')

  return <DashboardShell user={session.user}>{children}</DashboardShell>
}
