'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, GraduationCap, Users, X } from 'lucide-react'

export function LoginChoiceModal() {
  const router = useRouter()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-[#CBFBF1] bg-white shadow-[0_30px_100px_rgba(10,37,64,.28)] dark:border-white/10 dark:bg-slate-950">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 bg-white/90 text-slate-600 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
          aria-label="Close login modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-slate-900/10 bg-[radial-gradient(circle_at_top_left,_rgba(0,196,180,.14),_transparent_42%),linear-gradient(135deg,#0A2540_0%,#0D3A5C_56%,#0E5060_100%)] px-6 py-6 text-white dark:border-white/10">
          <div className="flex items-center gap-3">
            <Image src="/elevateos-logo.png" alt="ElevateOS" width={54} height={54} className="h-12 w-12 rounded-2xl bg-white/95 p-1 shadow-lg" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#CBFBF1]">Login choice</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Who is logging in?</h1>
            </div>
          </div>
          <p className="mt-3 max-w-md text-sm leading-7 text-white/78">
            Pick the role first so we can send you to the right experience. Tutor login is a separate button on the home page.
          </p>
        </div>

        <div className="grid gap-3 p-6">
          <Link
            href="/student-dashboard"
            className="group rounded-[1.5rem] border border-slate-900/10 bg-[#F0FDFA] p-4 transition hover:-translate-y-0.5 hover:border-[#00C4B4]/40 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A2540] text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-950 dark:text-white">Student login</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Open the student dashboard and schedule workflow.</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#00C4B4]" />
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#00C4B4]/40 dark:border-white/10 dark:bg-slate-950/60"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00C4B4]/15 text-[#0E5060]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-950 dark:text-white">Parent login</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Read summaries, activity planning, and progress.</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#00C4B4]" />
            </div>
          </Link>

          <div className="rounded-[1.5rem] border border-[#CBFBF1] bg-[#F0FDFA] p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            If you are a tutor, use the home page tutor log-in button once it is ready. For now it remains a non-functional placeholder.
          </div>
        </div>
      </div>
    </div>
  )
}
