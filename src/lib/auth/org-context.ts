type SessionLike = {
  user?: {
    orgId?: string | null
    id?: string | null
    email?: string | null
  }
}

/**
 * Authoritative org resolver only.
 *
 * This function intentionally does NOT derive org from email domains,
 * user ids, or other heuristics.
 */
export function getAuthoritativeOrgId(session: SessionLike): string | null {
  const orgId = session.user?.orgId
  if (!orgId || typeof orgId !== 'string') return null
  const trimmed = orgId.trim()
  return trimmed.length ? trimmed : null
}
