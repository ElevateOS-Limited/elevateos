import { NextResponse } from 'next/server'
import { DEMO_EMAIL, DEMO_MODE } from '@/lib/auth/demo'

type AllowedRole = 'OWNER' | 'ADMIN' | 'TUTOR' | 'PARENT' | 'STUDENT' | 'USER'

type RoleCheckContext = {
  email?: string | null
  allowExplicitDemoTutorFallback?: boolean
}

function normalizeRole(
  role: string | null | undefined,
  context?: RoleCheckContext
): AllowedRole | null {
  if (!role) return null
  const upper = role.toUpperCase() as AllowedRole

  const shouldFallbackToTutor =
    upper === 'USER' &&
    DEMO_MODE &&
    context?.allowExplicitDemoTutorFallback === true &&
    context?.email?.toLowerCase() === DEMO_EMAIL.toLowerCase()

  if (shouldFallbackToTutor) return 'TUTOR'

  return upper
}

export function hasRequiredRole(
  role: string | null | undefined,
  allowed: AllowedRole[],
  context?: RoleCheckContext
) {
  const normalized = normalizeRole(role, context)
  if (!normalized) return false
  return allowed.includes(normalized)
}

export function forbiddenResponse() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
