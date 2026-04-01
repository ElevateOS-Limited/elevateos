import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { execSync } from 'node:child_process'
import { getConfiguredAIStatus } from '@/lib/ai/provider'
import { GOOGLE_AUTH_CONFIGURED } from '@/lib/auth/options'

function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: process.cwd() }).toString().trim()
  } catch {
    return 'unknown'
  }
}

function healthAuthOk(req: Request): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  const secret = process.env.HEALTH_CHECK_SECRET?.trim()
  if (!secret) return false
  const auth = req.headers.get('authorization')
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  const header = req.headers.get('x-health-secret')?.trim() ?? ''
  return bearer === secret || header === secret
}

export async function GET(req: Request) {
  const startedAt = Date.now()
  const detailed = healthAuthOk(req)
  const demoMode = process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  const databaseConfigured = Boolean(process.env.DATABASE_URL)

  let dbOk = demoMode || !databaseConfigured
  let dbChecked = false
  let dbMessage = demoMode ? 'demo mode' : 'DATABASE_URL not set'

  if (!demoMode && databaseConfigured) {
    dbChecked = true
    try {
      await prisma.$queryRaw`SELECT 1`
      dbOk = true
      dbMessage = 'ok'
    } catch (error) {
      dbOk = false
      dbMessage = error instanceof Error ? error.message : 'db error'
    }
  }

  const status = dbOk ? 'ok' : 'degraded'

  if (!detailed) {
    const payload = {
      status,
      service: 'elevateos-demo',
      timestamp: new Date().toISOString(),
      db: {
        ok: dbOk,
        checked: dbChecked,
        message: dbMessage,
      },
      responseMs: Date.now() - startedAt,
    }
    return NextResponse.json(payload, { status: dbOk ? 200 : 503 })
  }

  const ai = getConfiguredAIStatus()

  const payload = {
    status,
    service: 'elevateos-demo',
    env: process.env.NODE_ENV || 'unknown',
    buildVersion: process.env.APP_VERSION || 'v0.0.0',
    gitCommit: getGitCommit(),
    modelProvider: ai.provider,
    model: ai.model,
    auth: {
      googleConfigured: GOOGLE_AUTH_CONFIGURED,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'unset',
    },
    envChecks: {
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
      nextAuthSecretConfigured: Boolean(process.env.NEXTAUTH_SECRET),
    },
    db: { ok: dbOk, checked: dbChecked, message: dbMessage },
    uptimeSeconds: Math.floor(process.uptime()),
    responseMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(payload, { status: dbOk ? 200 : 503 })
}
