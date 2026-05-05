import NextAuth from "next-auth";
import type { NextRequest } from 'next/server';
import { authOptions } from "@/lib/auth/options";
import { withServiceDbContext } from "@/lib/db/rls";

const handler = NextAuth(authOptions);

type NextAuthRouteContext = {
  params: Promise<{ nextauth?: string[] }>
}

export function GET(request: NextRequest, context: NextAuthRouteContext) {
  return withServiceDbContext(() => handler(request, context))
}

export function POST(request: NextRequest, context: NextAuthRouteContext) {
  return withServiceDbContext(() => handler(request, context))
}
