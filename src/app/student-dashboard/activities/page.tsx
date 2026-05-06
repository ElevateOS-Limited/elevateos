import { StudentWorkspaceSurface } from '@/components/demo/StudentWorkspaceSurface'

type ActivitiesPageProps = {
  searchParams?: Promise<{
    mode?: string
  }>
}

export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  const params = await searchParams
  const mode = params?.mode === 'demo' ? 'demo' : 'blank'

  return <StudentWorkspaceSurface mode={mode} view="activities" />
}

