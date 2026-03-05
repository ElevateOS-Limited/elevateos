export function withOrgScope<T extends Record<string, any>>(orgId: string | null | undefined, where: T = {} as T) {
  if (!orgId) return where
  return { ...where, orgId }
}
