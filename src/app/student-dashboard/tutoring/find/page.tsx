import { StudentWorkspaceSurface } from '@/components/demo/StudentWorkspaceSurface'

type FindTutorPageProps = {
  searchParams?: Promise<{
    mode?: string
  }>
}

export default async function FindTutorPage({ searchParams }: FindTutorPageProps) {
  const params = await searchParams
  const mode = params?.mode === 'demo' ? 'demo' : 'blank'

  return <StudentWorkspaceSurface mode={mode} view="find-tutor" />
}

