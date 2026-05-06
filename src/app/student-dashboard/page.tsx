import { redirect } from 'next/navigation'

type StudentDashboardPageProps = {
  searchParams?: Promise<{
    mode?: string
  }>
}

export default async function StudentDashboardPage({ searchParams }: StudentDashboardPageProps) {
  const params = await searchParams
  const mode = params?.mode === 'blank' ? 'blank' : 'demo'

  redirect(`/dashboard?mode=${mode}`)
}
