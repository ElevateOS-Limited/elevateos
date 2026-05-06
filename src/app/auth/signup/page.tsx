import { redirect } from 'next/navigation'

export default function AuthSignupRedirect() {
  redirect('/onboarding?mode=blank')
}
