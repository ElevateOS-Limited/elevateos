import { StudentWorkspaceSurface } from '@/components/demo/StudentWorkspaceSurface'

type TutoringPageProps = {
  searchParams?: Promise<{
    mode?: string
  }>
}

export default async function TutoringPage({ searchParams }: TutoringPageProps) {
  const params = await searchParams
  const mode = params?.mode === 'demo' ? 'demo' : 'blank'

  return <StudentWorkspaceSurface mode={mode} view="tutoring" />
}

