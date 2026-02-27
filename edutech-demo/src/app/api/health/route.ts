import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { execSync } from 'node:child_process'

function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: process.cwd() }).toString().trim()
  } catch {
    return 'unknown'
  }
}

export async function GET() {
  const startedAt = Date.now()

  let db = { ok: false, message: 'not checked' }
  try {
    await prisma.$queryRaw`SELECT 1`
    db = { ok: true, message: 'ok' }
  } catch (e: any) {
    db = { ok: false, message: e?.message || 'db error' }
  }

  const payload = {
    status: db.ok ? 'ok' : 'degraded',
    service: 'edutech-demo',
    env: process.env.NODE_ENV || 'unknown',
    buildVersion: process.env.APP_VERSION || 'v0.0.0',
    gitCommit: getGitCommit(),
    modelProvider: process.env.OPENAI_API_KEY ? 'openai' : 'none',
    model: process.env.OPENAI_MODEL || 'unset',
    db,
    uptimeSeconds: Math.floor(process.uptime()),
    responseMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(payload, { status: db.ok ? 200 : 503 })
}
