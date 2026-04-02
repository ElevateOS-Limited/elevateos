import { NextRequest, NextResponse } from 'next/server'
import { getSiteVariantFromHost } from '@/lib/site'

const blockedAgents = [
  /HTTrack/i,
  /WebCopier/i,
  /wget/i,
  /curl/i,
  /python-requests/i,
  /scrapy/i,
  /aiohttp/i,
  /Go-http-client/i,
  /libwww-perl/i,
]

const badQuery = /(\.\.|%2e%2e|union\s+select|select\s+.*from|<script|\/etc\/passwd)/i
const healthPaths = new Set(['/healthz', '/api/health'])

export function proxy(request: NextRequest) {
  if (healthPaths.has(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const userAgent = request.headers.get('user-agent') || ''
  const query = request.nextUrl.search || ''

  if (blockedAgents.some((pattern) => pattern.test(userAgent)) || badQuery.test(query)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.hostname).toLowerCase()

  if (host === 'activities.thinkcollegelevel.com') {
    const rewriteUrl = request.nextUrl.clone()
    if (!rewriteUrl.pathname.startsWith('/_next') && rewriteUrl.pathname !== '/favicon.ico') {
      rewriteUrl.pathname = '/activities'
      return NextResponse.rewrite(rewriteUrl)
    }
  }

  const siteVariant = getSiteVariantFromHost(host)
  if (siteVariant === 'tutoring' && request.nextUrl.pathname === '/dashboard') {
    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = '/dashboard/partner'
    return NextResponse.rewrite(rewriteUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|healthz|api/health).*)'],
}
