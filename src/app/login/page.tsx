'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getProviders, getSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getRoleHomePath } from '@/lib/auth/routes'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleAvailable, setGoogleAvailable] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    let active = true

    async function loadProviders() {
      const providers = await getProviders()
      if (active) setGoogleAvailable(Boolean(providers?.google))
    }

    async function redirectIfSignedIn() {
      const session = await getSession()
      if (session?.user?.role) {
        router.replace(getRoleHomePath(session.user.role))
      }
    }

    void loadProviders()
    void redirectIfSignedIn()

    return () => {
      active = false
    }
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (!result?.ok) {
        throw new Error('Invalid email or password')
      }

      const session = await getSession()
      router.replace(getRoleHomePath(session?.user?.role))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,196,180,.10),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(13,58,92,.10),_transparent_25%),linear-gradient(180deg,#f9fafb_0%,#ffffff_100%)] px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <section className="max-w-xl">
          <Link href="/home" className="inline-flex items-center gap-3">
            <Image src="/logo-lockup-horizontal.svg" alt="ElevateOS" width={220} height={64} className="h-12 w-auto" priority />
          </Link>

          <h1 className="font-display mt-8 text-5xl leading-[0.95] tracking-tight sm:text-6xl">
            Sign in and go straight to the right tutoring view.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600 dark:text-slate-300">
            Students land on tasks, tutors land on the workspace, parents land on the report view, and admins land on the management panel.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
            {['Role routing', 'Parent visibility', 'Tutor workflow', 'AI-assisted summaries'].map((item) => (
              <span key={item} className="rounded-full border border-[#CBFBF1] bg-[#F0FDFA] px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-900/10 bg-white/95 p-6 shadow-2xl shadow-[0_20px_60px_rgba(15,23,42,.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
          {googleAvailable ? (
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/login' })}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#00C4B4]/30 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:text-white"
            >
              Continue with Google
            </button>
          ) : null}

          {googleAvailable ? (
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-900/10 dark:bg-white/10" />
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Or</span>
              <div className="h-px flex-1 bg-slate-900/10 dark:bg-white/10" />
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00C4B4] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(0,196,180,.45)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Sign in
            </button>

            {message ? (
              <p className="text-sm text-rose-600 dark:text-rose-300">{message}</p>
            ) : null}
          </form>

          <div className="mt-6 rounded-[1.5rem] border border-[#CBFBF1] bg-[#F0FDFA] p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            New families should start with onboarding so we can capture the right role, the right contact path, and the right tutoring context.
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
            <Link href="/onboarding" className="font-semibold text-slate-950 underline-offset-4 hover:underline dark:text-white">
              Start onboarding
            </Link>
            <Link href="/home" className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
