import { NextRequest, NextResponse } from 'next/server'

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

export function middleware(req: NextRequest) {
  const ua = req.headers.get('user-agent') || ''
  const q = req.nextUrl.search || ''

  if (blockedAgents.some((re) => re.test(ua)) || badQuery.test(q)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
