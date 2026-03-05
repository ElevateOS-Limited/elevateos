import { NextResponse } from 'next/server'

type AllowedRole = 'OWNER' | 'ADMIN' | 'TUTOR' | 'PARENT' | 'STUDENT' | 'USER'

export function hasRequiredRole(role: string | null | undefined, allowed: AllowedRole[]) {
  if (!role) return false
  return allowed.includes(role as AllowedRole)
}

export function forbiddenResponse() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
