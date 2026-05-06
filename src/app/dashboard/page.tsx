'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  ScanLine,
  Settings,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import DemoWalkthroughRail from '@/components/public/DemoWalkthroughRail'
import {
  createWorkspaceState,
  getMonthGrid,
  loadWorkspaceState,
  saveWorkspaceState,
  toIsoDate,
  WEEK_DAYS,
  type DemoMode,
  type DemoWorkspaceState,
} from '@/lib/demo/student-flow'

type Availability = 'open' | 'busy'

const QUICK_ACTIONS = [
  { href: '/dashboard/study', label: 'Study Help', icon: BookOpen, desc: 'Upload content and generate structured notes.' },
  { href: '/dashboard/worksheets', label: 'Worksheets', icon: FileText, desc: 'Create practice questions for the current topic.' },
  { href: '/dashboard/pastpapers', label: 'Past Papers', icon: Clock3, desc: 'Run timed exam simulation for revision.' },
  { href: '/dashboard/admissions', label: 'Admissions', icon: GraduationCap, desc: 'Check target-school fit and strategy.' },
  { href: '/dashboard/internships', label: 'Internships', icon: Briefcase, desc: 'Review opportunities that support your profile.' },
  { href: '/dashboard/planner', label: 'Activity Planner', icon: CalendarClock, desc: 'Map open time to meaningful activity slots.' },
  { href: '/dashboard/paper-scan', label: 'Paper Scanner', icon: ScanLine, desc: 'Mark right or wrong from photographed papers.' },
  { href: '/dashboard/extracurriculars', label: 'EC Scoring', icon: Trophy, desc: 'Score extracurricular strength against targets.' },
  { href: 'https://tutoring.elevateos.org/dashboard', label: 'Tutor hub', icon: Users, desc: 'Sessions, recaps, and follow-ups.' },
]

function formatSubject(slot: { subject: string; level: string }) {
  const subject = slot.subject.trim()
  if (!subject) return ''
  return slot.level ? `${subject} ${slot.level}` : subject
}

function defaultWeeklyAvailability(mode: DemoMode): Record<string, Availability> {
  if (mode === 'demo') {
    return {
      Monday: 'open',
      Tuesday: 'busy',
      Wednesday: 'open',
      Thursday: 'open',
      Friday: 'busy',
      Saturday: 'open',
      Sunday: 'busy',
    }
  }

  return WEEK_DAYS.reduce(
    (acc, day) => {
      acc[day] = 'busy'
      return acc
    },
    {} as Record<string, Availability>,
  )
}

function hydrateWorkspaceState(state: DemoWorkspaceState, mode: DemoMode) {
  const weeklyAvailability = state.schedule.weeklyAvailability || defaultWeeklyAvailability(mode)

  return {
    ...state,
    profile: {
      ...state.profile,
      intendedMajor: state.profile.intendedMajor || (mode === 'demo' ? 'Computer Science' : ''),
      careerInterests: state.profile.careerInterests || (mode === 'demo' ? ['AI', 'Robotics', 'Entrepreneurship'] : []),
    },
    schedule: {
      ...state.schedule,
      weeklyAvailability,
    },
  }
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#F9FAFB] p-4 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const mode = (searchParams.get('mode') === 'blank' ? 'blank' : 'demo') as DemoMode
  const [workspace, setWorkspace] = useState<DemoWorkspaceState>(() => hydrateWorkspaceState(createWorkspaceState(mode), mode))
  const [loaded, setLoaded] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  useEffect(() => {
    const saved = loadWorkspaceState(mode)
    setWorkspace(hydrateWorkspaceState(saved ?? createWorkspaceState(mode), mode))
    const now = new Date()
    setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setLoaded(true)
  }, [mode])

  useEffect(() => {
    if (!loaded) return
    saveWorkspaceState(mode, workspace)
  }, [loaded, mode, workspace])

  const selectedSubjects = workspace.subjects.filter((slot) => slot.subject.trim())
  const targetSchools = workspace.activities.targetUniversities.filter((school) => school.trim())
  const careerInterests = workspace.profile.careerInterests.length
    ? workspace.profile.careerInterests
    : mode === 'demo'
      ? ['AI', 'Robotics', 'Entrepreneurship']
      : []
  const weeklyAvailability = workspace.schedule.weeklyAvailability || defaultWeeklyAvailability(mode)
  const openDays = Object.values(weeklyAvailability).filter((value) => value === 'open').length
  const blockedDates = workspace.schedule.blockedDates
  const monthGrid = useMemo(() => getMonthGrid(viewMonth), [viewMonth])
  const todayIso = useMemo(() => toIsoDate(new Date()), [])
  const displayName = mode === 'demo' ? session?.user?.name || 'ElevateOS Demo Student' : 'Student'
  const heroSubtitle =
    mode === 'demo'
      ? `IB student. Target schools: ${targetSchools.length ? targetSchools.slice(0, 3).join(', ') : 'University of Tokyo, Waseda University, Keio University'}.`
      : 'Set up your profile to unlock better recommendations.'
  const subjectSummary = selectedSubjects.length ? selectedSubjects.slice(0, 3).map(formatSubject).join(', ') : 'Add subjects'
  const major = workspace.profile.intendedMajor || (mode === 'demo' ? 'Computer Science' : 'Not set')
  const profileSignals = [
    workspace.profile.curriculum,
    selectedSubjects.length,
    workspace.profile.intendedMajor,
    targetSchools.length,
    workspace.profile.goalsNarrative,
    openDays,
  ].filter(Boolean).length
  const nextStep =
    mode === 'demo' && targetSchools.length
      ? 'Finish UTokyo and Waseda shortlists'
      : 'Complete your profile, then generate one worksheet and one admissions analysis to establish a baseline.'

  const updateAvailability = (day: string) => {
    setWorkspace((current) => ({
      ...current,
      schedule: {
        ...current.schedule,
        weeklyAvailability: {
          ...current.schedule.weeklyAvailability,
          [day]: (current.schedule.weeklyAvailability?.[day] ?? defaultWeeklyAvailability(mode)[day]) === 'open' ? 'busy' : 'open',
        },
      },
    }))
  }

  const toggleBlockedDate = (isoDate: string) => {
    setWorkspace((current) => ({
      ...current,
      schedule: {
        ...current.schedule,
        blockedDates: current.schedule.blockedDates.includes(isoDate)
          ? current.schedule.blockedDates.filter((value) => value !== isoDate)
          : [...current.schedule.blockedDates, isoDate],
      },
    }))
  }

  if (status === 'loading' || !loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <p className="text-sm font-medium">Loading dashboard…</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[2rem] border border-slate-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#CBFBF1] bg-[#F0FDFA] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#0E5060]">
                <Sparkles className="h-3.5 w-3.5 text-[#00C4B4]" />
                Today at a glance
              </div>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-[#00C4B4]/40 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>

            <h1 className="mt-4 text-4xl tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Welcome back, {displayName}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">{heroSubtitle}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <MetricCard label="Study materials" value={0} />
              <MetricCard label="Worksheets" value={0} />
              <MetricCard label="Open days" value={openDays} />
            </div>

            {!workspace.profile.curriculum ? (
              <div className="mt-6 flex flex-col gap-3 rounded-[1.25rem] border border-[#CBFBF1] bg-[#F0FDFA] p-4 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white">Complete your profile for stronger recommendations</p>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">Add curriculum, subjects, target universities, and weekly availability.</p>
                </div>
                <Link href={`/onboarding?mode=${mode}`} className="inline-flex items-center gap-2 rounded-full bg-[#00C4B4] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(0,196,180,.45)]">
                  Finish profile <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </div>

          <DemoWalkthroughRail
            eyebrow="Demo subtitles"
            title="Tutoring MVP today. Annual counselling next."
            summary="Walk through the product in the same order every time: show the schedule, open tutoring, then branch into annual counselling and activities."
            steps={[
              {
                label: 'Start with today',
                subtitle: 'Show the weekly availability and calendar so the student context is visible immediately.',
              },
              {
                label: 'Open tutoring',
                subtitle: 'Use the tutoring hub to show lessons, homework, recaps, and tutor follow-up.',
              },
              {
                label: 'Open annual counselling',
                subtitle: 'Switch to activities, target schools, admissions strategy, and long-range planning.',
              },
              {
                label: 'Finish on the next step',
                subtitle: 'End the demo on a clear next action, not a dead-end screen.',
              },
            ]}
            activeStep={1}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00C4B4]">This week</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Weekly availability</h2>
            </div>
            <Link href="/dashboard/calendar" className="text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Edit schedule
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {WEEK_DAYS.map((day) => {
              const available = weeklyAvailability[day] === 'open'
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => updateAvailability(day)}
                  className={cn(
                    'rounded-2xl border p-4 text-left transition hover:-translate-y-0.5',
                    available
                      ? 'border-[#CBFBF1] bg-[#F0FDFA] text-slate-950 shadow-sm'
                      : 'border-slate-900/10 bg-[#F9FAFB] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200',
                  )}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{day}</p>
                  <p className={cn('mt-2 text-sm font-semibold', available ? 'text-[#0E5060]' : 'text-slate-700 dark:text-slate-200')}>
                    {available ? 'Open' : 'Busy'}
                  </p>
                </button>
              )
            })}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-slate-900/10 bg-[#F9FAFB] p-4 dark:border-white/10 dark:bg-slate-950/40">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Monthly calendar</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                  className="rounded-full border border-slate-900/10 px-3 py-1.5 dark:border-white/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[130px] text-center font-semibold">
                  {viewMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                  className="rounded-full border border-slate-900/10 px-3 py-1.5 dark:border-white/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`${day}-${index}`} className="text-center">
                  {day}
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {monthGrid.map((date, index) => {
                if (!date) return <div key={index} className="h-8" />
                const iso = toIsoDate(date)
                const isPast = iso < todayIso
                const isBlocked = blockedDates.includes(iso)

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => toggleBlockedDate(iso)}
                    className={cn(
                      'flex h-8 items-center justify-center rounded-md border text-xs transition',
                      isPast
                        ? 'border-slate-200 bg-white text-slate-400 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-500'
                        : isBlocked
                          ? 'border-[#00C4B4] bg-[#F0FDFA] text-[#0E5060] dark:border-[#2DD4BF] dark:bg-[#0A2540]/20 dark:text-[#CBFBF1]'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-[#00C4B4]/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200',
                    )}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#CBFBF1]">Profile</p>
          <h2 className="mt-2 text-2xl font-semibold">Profile details</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ['Curriculum', workspace.profile.curriculum || 'Not set'],
              ['Subjects', subjectSummary],
              ['Major', major],
              ['Targets', targetSchools.length ? targetSchools.slice(0, 3).join(', ') : 'Add universities'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold">Profile completeness</p>
            <p className="mt-2 text-3xl font-semibold">{profileSignals}/6</p>
            <p className="mt-2 text-sm text-white/70">Add more profile details to improve recommendations.</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/75">
            {(careerInterests.length ? careerInterests : ['Add career interests']).map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {item}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00C4B4]">Quick actions</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Jump directly to the next task</h2>
          </div>
          <p className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">Keep the flow short and direct.</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map((action) =>
            action.href.startsWith('http') ? (
              <a
                key={action.href}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-5 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <action.icon className="h-6 w-6 text-[#00C4B4]" />
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#00C4B4]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{action.label}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{action.desc}</p>
              </a>
            ) : (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-5 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <action.icon className="h-6 w-6 text-[#00C4B4]" />
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#00C4B4]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{action.label}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{action.desc}</p>
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Recent study materials</h2>
            <Link href="/dashboard/study" className="text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Open study →
            </Link>
          </div>
          <div className="mt-5 divide-y divide-slate-900/10 overflow-hidden rounded-[1.25rem] border border-slate-900/10 dark:divide-white/10 dark:border-white/10">
            <div className="bg-white px-4 py-8 text-sm text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
              No study materials yet. Start with a session and the dashboard will fill in automatically.
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Progress at a glance</h2>
            <BarChart3 className="h-5 w-5 text-[#CBFBF1]" />
          </div>

          <div className="mt-5 grid gap-3">
            {[
              ['Worksheets created', 0],
              ['Open days this week', openDays],
              ['Blocked dates', blockedDates.length],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{value as number}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#CBFBF1]" />
              <p className="text-sm font-semibold">Next step</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/75">{nextStep}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/75">
            {(targetSchools.length ? targetSchools.slice(0, 3) : ['Add target universities']).map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {item}
              </span>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
