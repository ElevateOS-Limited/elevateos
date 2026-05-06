import { SignupWizard } from '@/components/public/SignupWizard'

type OnboardingPageProps = {
  searchParams?: Promise<{
    mode?: string
  }>
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams
  const mode = params?.mode === 'demo' ? 'demo' : 'blank'

  return <SignupWizard initialMode={mode} />
}

