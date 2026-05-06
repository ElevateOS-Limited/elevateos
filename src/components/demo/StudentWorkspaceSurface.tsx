'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Filter,
  GraduationCap,
  MessageSquareText,
  Settings,
  Sparkles,
  Star,
  Target,
  Search,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createWorkspaceState,
  formatDemoDate,
  getMonthGrid,
  loadWorkspaceState,
  parseIsoDateLocal,
  resolveActivityFinderCompletion,
  resolveTutorSearchCompletion,
  saveWorkspaceState,
  toIsoDate,
  WEEK_DAYS,
  type ActivityItem,
  type DemoMode,
  type DemoWorkspaceState,
  type ScheduleBlock,
  type TutorMatch,
} from '@/lib/demo/student-flow'

type WorkspaceView = 'overview' | 'tutoring' | 'find-tutor' | 'activities'

type StudentWorkspaceSurfaceProps = {
  mode: DemoMode
  view: WorkspaceView
}

const VIEW_LABELS: Record<WorkspaceView, string> = {
  overview: 'Overview',
  tutoring: 'Tutoring',
  'find-tutor': 'Find a tutor',
  activities: 'University / Activities',
}

const viewToRoute: Record<WorkspaceView, string> = {
  overview: '/student-dashboard',
  tutoring: '/student-dashboard/tutoring',
  'find-tutor': '/student-dashboard/tutoring/find',
  activities: '/student-dashboard/activities',
}

function priceValue(price: string) {
  const match = price.match(/(\d+)/)
  return match ? Number(match[1]) : 0
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function copyWorkspaceState(state: DemoWorkspaceState) {
  return JSON.parse(JSON.stringify(state)) as DemoWorkspaceState
}

function DemoHeader({
  mode,
  view,
}: {
  mode: DemoMode
  view: WorkspaceView
}) {
  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-900/10 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <Link href="/home" className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#CBFBF1] bg-white shadow-[0_10px_24px_-10px_rgba(10,37,64,.18)]">
          <Image src="/logo-mark.svg" alt="ElevateOS" width={42} height={42} className="h-10 w-10 rounded-xl bg-transparent p-0 object-contain" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#00C4B4]">Student workspace</p>
          <h1 className="font-display mt-1 text-3xl tracking-tight">ElevateOS student demo</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(VIEW_LABELS) as WorkspaceView[]).map((item) => {
          const active = item === view
          return (
            <Link
              key={item}
              href={viewToRoute[item] + (mode === 'demo' ? '?mode=demo' : '')}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                active
                  ? 'bg-[#0A2540] text-white'
                  : 'border border-slate-900/10 bg-white text-slate-700 hover:border-[#00C4B4]/40 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white',
              )}
            >
              {VIEW_LABELS[item]}
            </Link>
          )
        })}
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#00C4B4]/40 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </header>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#F0FDFA] p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}

function monthBlocksLabel(blocks: ScheduleBlock[]) {
  if (!blocks.length) return 'No recurring blocks yet'
  return blocks
    .slice(0, 3)
    .map((block) => `${block.day} ${block.start}-${block.end}`)
    .join(' / ')
}

function TutorCard({
  tutor,
  selected,
  onSelect,
}: {
  tutor: TutorMatch
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group w-full rounded-[1.5rem] border p-4 text-left transition hover:-translate-y-0.5',
        selected
          ? 'border-[#0A2540] bg-[linear-gradient(135deg,#0A2540_0%,#0D3A5C_65%,#0E5060_100%)] text-white'
          : 'border-slate-900/10 bg-white dark:border-white/10 dark:bg-white/5',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold">{tutor.name}</p>
          <p className={cn('mt-1 text-sm', selected ? 'text-white/72' : 'text-slate-500 dark:text-slate-400')}>{tutor.university}</p>
        </div>
        <div className={cn('rounded-full border px-3 py-1 text-xs font-semibold', selected ? 'border-white/20 bg-white/10 text-white' : 'border-[#00C4B4]/20 bg-[#F0FDFA] text-[#0E5060]')}>
          {tutor.price}
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <p className={cn(selected ? 'text-white/75' : 'text-slate-600 dark:text-slate-300')}>
          <span className="font-semibold">Education:</span> {tutor.education}
        </p>
        <p className={cn(selected ? 'text-white/75' : 'text-slate-600 dark:text-slate-300')}>
          <span className="font-semibold">Experience:</span> {tutor.teachingExperience}
        </p>
        <p className={cn(selected ? 'text-white/75' : 'text-slate-600 dark:text-slate-300')}>
          <span className="font-semibold">Grades:</span> {tutor.grades}
        </p>
        <p className={cn(selected ? 'text-white/75' : 'text-slate-600 dark:text-slate-300')}>
          <span className="font-semibold">Style:</span> {tutor.style}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tutor.availability.map((slot) => (
          <span
            key={slot}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium',
              selected ? 'border-white/15 bg-white/10 text-white/80' : 'border-slate-900/10 bg-[#F0FDFA] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200',
            )}
          >
            {slot}
          </span>
        ))}
      </div>
    </button>
  )
}

function OverviewView({
  mode,
  workspace,
  setWorkspace,
}: {
  mode: DemoMode
  workspace: DemoWorkspaceState
  setWorkspace: React.Dispatch<React.SetStateAction<DemoWorkspaceState>>
}) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const grid = getMonthGrid(month)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const firstName = workspace.mode === 'demo' ? 'Yuki' : 'Student'
  const weeklyAvailability =
    workspace.schedule.weeklyAvailability ||
    (mode === 'demo'
      ? {
          Monday: 'open',
          Tuesday: 'busy',
          Wednesday: 'open',
          Thursday: 'open',
          Friday: 'busy',
          Saturday: 'open',
          Sunday: 'busy',
        }
      : WEEK_DAYS.reduce(
          (acc, day) => {
            acc[day] = 'busy'
            return acc
          },
          {} as Record<string, 'open' | 'busy'>,
        ))

  const openDays = Object.values(weeklyAvailability).filter((value) => value === 'open').length

  return (
    <section className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
      <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Today at a glance</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back, {firstName}.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              {workspace.profile.curriculum
                ? `${workspace.profile.curriculum} student / ${workspace.profile.country || 'country not set'}`
                : 'Blank profile / fill the intake and the dashboard updates immediately.'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-900/10 bg-[#F0FDFA] px-4 py-3 text-right dark:border-white/10 dark:bg-slate-950/40">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Mode</p>
            <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{mode === 'demo' ? 'Demo student' : 'Blank profile'}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <MiniStat label="Selected subjects" value={workspace.subjects.filter((slot) => slot.subject.trim()).length} />
          <MiniStat label="Blocked days" value={workspace.schedule.blockedDates.length} />
          <MiniStat label="Open weekdays" value={openDays} />
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-900/10 bg-[#0A2540] p-4 text-white dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#CBFBF1]">Your goals</p>
              <p className="mt-2 text-sm leading-7 text-white/80">
                {workspace.profile.goalsNarrative || 'No goals written yet. Add a short description in the signup wizard.'}
              </p>
            </div>
            <Link href="/student-dashboard/activities" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0A2540]">
              Edit in activities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-slate-950/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Current schedule</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {workspace.schedule.weeklyHoursStart && workspace.schedule.weeklyHoursEnd
                  ? `About ${workspace.schedule.weeklyHoursStart} to ${workspace.schedule.weeklyHoursEnd} hours/week`
                  : 'Availability not yet set'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                className="rounded-full border border-slate-900/10 px-3 py-1.5 dark:border-white/10"
              >
                Prev
              </button>
              <span className="min-w-[140px] text-center font-semibold">{month.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
              <button
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                className="rounded-full border border-slate-900/10 px-3 py-1.5 dark:border-white/10"
              >
                Next
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
          <div className="mt-2 grid grid-cols-7 gap-1">
            {grid.map((date, index) => {
              if (!date) return <div key={index} className="h-9" />
              const iso = toIsoDate(date)
              const blocked = workspace.schedule.blockedDates.includes(iso)
              const selected = selectedDay === iso
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() =>
                    setWorkspace((current) => ({
                      ...current,
                      schedule: {
                        ...current.schedule,
                        blockedDates: current.schedule.blockedDates.includes(iso)
                          ? current.schedule.blockedDates.filter((day) => day !== iso)
                          : [...current.schedule.blockedDates, iso],
                      },
                    }))
                  }
                  onMouseEnter={() => setSelectedDay(iso)}
                  title={blocked ? 'Blocked day' : 'Free day'}
                  className={cn(
                    'h-9 rounded-xl border text-xs font-semibold transition',
                    selected || blocked
                      ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200'
                      : 'border-slate-900/10 bg-white text-slate-700 hover:border-[#00C4B4]/40 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200',
                  )}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      </article>

      <aside className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/student-dashboard/tutoring"
            className="rounded-[1.5rem] border border-[#CBFBF1] bg-[#F0FDFA] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#00C4B4]/40 dark:border-white/10 dark:bg-white/5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Tutoring</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Your tutoring hub</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Profile preferences, homework, upcoming sessions, reading, and tutor messaging.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0A2540] dark:text-white">
              Open tutoring
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          <Link
            href="/student-dashboard/activities"
            className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#00C4B4]/40 dark:border-white/10 dark:bg-slate-950/40"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Activities</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">University / activities</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Goals, target universities, activity finder, and university-fit analysis.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0A2540] dark:text-white">
              Open activities
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>

        <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#CBFBF1]">Upcoming sessions</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Visual lesson timeline</h3>
            </div>
            <CalendarDays className="h-5 w-5 text-[#CBFBF1]" />
          </div>
          <div className="mt-5 space-y-3">
            {workspace.tutoring.upcomingSessions.length ? (
              workspace.tutoring.upcomingSessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{session.title}</p>
                      <p className="text-xs text-white/55">{session.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatDemoDate(session.date)}</p>
                      <p className="text-xs text-white/55">{session.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                No upcoming sessions yet. The calendar will fill once a tutor is matched.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Quick facts</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MiniStat label="Recurring blocks" value={workspace.schedule.recurringBlocks.length} />
            <MiniStat label="Current activities" value={workspace.activities.currentActivities.length} />
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{monthBlocksLabel(workspace.schedule.recurringBlocks)}</p>
        </div>
      </aside>
    </section>
  )
}

function TutoringView({
  mode,
  workspace,
  setWorkspace,
}: {
  mode: DemoMode
  workspace: DemoWorkspaceState
  setWorkspace: React.Dispatch<React.SetStateAction<DemoWorkspaceState>>
}) {
  const [showSubmitted, setShowSubmitted] = useState(false)
  const wordCountValue = wordCount(workspace.tutoring.preferenceSummary)
  const remainingWords = Math.max(0, 100 - wordCountValue)

  return (
    <section className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
      <article className="space-y-5">
        <div className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Your profile</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Tutor preferences in under 100 words</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Tutors see this before connecting with you. It keeps the lesson tailored without awkward back-and-forth.
          </p>

          <textarea
            value={workspace.tutoring.preferenceSummary}
            onChange={(event) =>
              setWorkspace((current) => ({
                ...current,
                tutoring: { ...current.tutoring, preferenceSummary: event.target.value },
              }))
            }
            rows={6}
            placeholder="Write the kind of tutor you want, how direct they should be, and how you like feedback."
            className="mt-4 w-full rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-slate-500 dark:text-slate-400">{remainingWords} words left</p>
            <Link href="/student-dashboard/tutoring/find" className="inline-flex items-center gap-2 rounded-full bg-[#00C4B4] px-4 py-2 font-semibold text-white">
              Find a tutor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Your assigned homework</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">No pending assignments!</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowSubmitted((value) => !value)}
              className="rounded-full border border-slate-900/10 bg-[#F0FDFA] px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#00C4B4]/40 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              View submitted assignments
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {(workspace.tutoring.homework.length ? workspace.tutoring.homework : ['No pending assignments!']).map((item) => (
              <div key={item} className="rounded-2xl border border-slate-900/10 bg-[#F0FDFA] px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                {item}
              </div>
            ))}
          </div>

          {showSubmitted ? (
            <div className="mt-4 rounded-2xl border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-slate-950/40">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Submitted assignments</p>
              <div className="mt-3 space-y-2">
                {workspace.tutoring.submittedAssignments.length ? (
                  workspace.tutoring.submittedAssignments.map((item) => (
                    <div key={item} className="rounded-xl border border-slate-900/10 bg-[#F0FDFA] px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Nothing has been submitted yet.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </article>

      <aside className="space-y-5">
        <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#CBFBF1]">Upcoming sessions</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Calendar above the lesson list</h3>
            </div>
            <Clock3 className="h-5 w-5 text-[#CBFBF1]" />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="grid grid-cols-7 gap-1 text-[10px] uppercase tracking-[0.2em] text-white/40">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`${day}-${index}`} className="text-center">
                  {day}
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {getMonthGrid(new Date()).map((date, index) => {
                if (!date) return <div key={index} className="h-8" />
                const hasSession = workspace.tutoring.upcomingSessions.some((session) => session.date === toIsoDate(date))
                return (
                  <div
                    key={toIsoDate(date)}
                    className={cn(
                      'flex h-8 items-center justify-center rounded-md border text-xs',
                      hasSession ? 'border-[#CBFBF1]/30 bg-[#00C4B4]/20 text-white' : 'border-white/10 bg-white/5 text-white/70',
                    )}
                  >
                    {date.getDate()}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {workspace.tutoring.upcomingSessions.length ? (
              workspace.tutoring.upcomingSessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{session.title}</p>
                      <p className="text-xs text-white/55">{session.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatDemoDate(session.date)}</p>
                      <p className="text-xs text-white/55">{session.time}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/72">{session.notes}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                No upcoming sessions yet. Match a tutor to populate this list.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Recommended reading</p>
          <div className="mt-4 space-y-3">
            {workspace.tutoring.reading.length ? (
              workspace.tutoring.reading.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-900/10 bg-[#F0FDFA] p-4 dark:border-white/10 dark:bg-slate-950/40">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {item.subject} / {item.source}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Recommended reading will appear here after your lessons start.</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Need help?</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">Message your tutor.</h3>
          <textarea
            value={workspace.tutoring.messageDraft}
            onChange={(event) =>
              setWorkspace((current) => ({
                ...current,
                tutoring: { ...current.tutoring, messageDraft: event.target.value },
              }))
            }
            rows={4}
            placeholder="Write a short note about what you want help with."
            className="mt-4 w-full rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
          />
          <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#00C4B4] px-4 py-2 text-sm font-semibold text-white">
            <MessageSquareText className="h-4 w-4" />
            Send message
          </button>
        </div>
      </aside>
    </section>
  )
}

function TutorFinderView({
  mode,
  workspace,
  setWorkspace,
}: {
  mode: DemoMode
  workspace: DemoWorkspaceState
  setWorkspace: React.Dispatch<React.SetStateAction<DemoWorkspaceState>>
}) {
  const [loading, setLoading] = useState(false)
  const [statusLines, setStatusLines] = useState<string[]>([])
  const [resultsReady, setResultsReady] = useState(mode === 'demo' && workspace.tutoring.tutorMatches.length > 0)
  const [filterPrice, setFilterPrice] = useState('Any')
  const [selectedTutor, setSelectedTutor] = useState<string>(workspace.tutoring.selectedTutorId || '')
  const [subject, setSubject] = useState(workspace.tutoring.tutorSearch.subject || 'Mathematics AA HL')
  const [preferences, setPreferences] = useState(workspace.tutoring.tutorSearch.preferences || '')
  const [timeSlot, setTimeSlot] = useState(workspace.tutoring.tutorSearch.timeSlot || '')

  useEffect(() => {
    if (!loading) return
    const lines = [
      'Finding your ideal tutor...',
      'Scanning tutor profiles in the background...',
      'Checking availability against your calendar...',
      'Ranking fit, style, and price...',
    ]
    let index = 0
    setStatusLines([lines[0]])
    const interval = window.setInterval(() => {
      index += 1
      setStatusLines((current) => [...current.slice(-2), lines[index % lines.length]])
    }, 600)
    const finish = window.setTimeout(() => {
      window.clearInterval(interval)
      setLoading(false)
      setWorkspace((current) => {
        const nextState = resolveTutorSearchCompletion({
          mode,
          current,
          lines,
          subject,
          preferences,
          timeSlot,
          priceFilter: filterPrice,
        })
        setResultsReady(nextState.resultsReady)
        return nextState.workspace
      })
    }, 2200)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(finish)
    }
  }, [filterPrice, loading, mode, preferences, setWorkspace, subject, timeSlot])

  const filteredTutors = workspace.tutoring.tutorMatches.filter((tutor) => {
    if (filterPrice === 'Any') return true
    const value = priceValue(tutor.price)
    if (filterPrice === 'Under $55/hr') return value <= 55
    if (filterPrice === '$55/hr and up') return value >= 55
    return true
  })

  const selectedDetails = filteredTutors.find((tutor) => tutor.id === selectedTutor) || filteredTutors[0] || null

  function runSearch() {
    if (mode === 'blank') {
      setLoading(true)
      setStatusLines(['Searching tutor pool...', 'No tutor results yet.'])
      window.setTimeout(() => {
        setLoading(false)
        setResultsReady(false)
      }, 1800)
      return
    }
    setLoading(true)
    setResultsReady(false)
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
      <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Find a tutor</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Tell us what you need help with.</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
          The tutee can name a subject, add optional style preferences, and pick an ideal time slot or say they have no preference.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Subject</span>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. Mathematics AA HL"
              className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Tutor style / specifications</span>
            <textarea
              rows={4}
              value={preferences}
              onChange={(event) => setPreferences(event.target.value)}
              placeholder="Optional. Example: structured, direct, and good at exam technique."
              className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Ideal time slot</span>
            <input
              value={timeSlot}
              onChange={(event) => setTimeSlot(event.target.value)}
              placeholder="e.g. Thursday after 5pm or no preference"
              className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Filter by price</span>
            <select
              value={filterPrice}
              onChange={(event) => setFilterPrice(event.target.value)}
              className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
            >
              {['Any', 'Under $55/hr', '$55/hr and up'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={runSearch}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00C4B4] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(0,196,180,.45)] transition hover:-translate-y-0.5"
          >
            <Search className="h-4 w-4" />
            Submit
          </button>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-900/10 bg-[#F0FDFA] p-4 dark:border-white/10 dark:bg-slate-950/40">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Your current preference summary</p>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {workspace.tutoring.preferenceSummary || 'This box will show the 100-word preference summary from the tutoring hub.'}
          </p>
        </div>
      </article>

      <aside className="space-y-5">
        <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#CBFBF1]">Finding your ideal tutor</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Tutors shifting in the background</h3>
            </div>
            <Users className="h-5 w-5 text-[#CBFBF1]" />
          </div>

          <div className="relative mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="absolute inset-0 opacity-80">
              <div className="absolute left-2 top-2 h-16 w-16 rounded-full bg-[#00C4B4]/25 blur-2xl" />
              <div className="absolute right-2 top-8 h-24 w-24 rounded-full bg-[#CBFBF1]/15 blur-2xl" />
              <div className="absolute bottom-0 left-10 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
            </div>

            <div className="relative grid grid-cols-3 gap-3">
              {['A', 'B', 'C', 'D', 'E', 'F'].map((letter, index) => (
                <div
                  key={letter}
                  className={cn(
                    'flex h-20 items-center justify-center rounded-[1.25rem] border text-2xl font-semibold backdrop-blur',
                    index % 2 === 0 ? 'border-white/10 bg-white/10 text-white' : 'border-[#CBFBF1]/20 bg-[#00C4B4]/20 text-[#CBFBF1]',
                  )}
                >
                  {letter}
                </div>
              ))}
            </div>

            <div className="relative mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              {loading ? (
                <div className="space-y-2 text-sm text-white/75">
                  {statusLines.map((line) => (
                    <div key={line} className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse text-[#CBFBF1]" />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/75">
                  {resultsReady ? 'Here are the current tutor fits.' : 'Press submit and the matching animation will play here.'}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniStat label="Matches" value={filteredTutors.length} />
            <MiniStat label="Price filter" value={filterPrice} />
            <MiniStat label="Selected" value={selectedDetails ? selectedDetails.name.split(' ')[0] : 'None'} />
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Potential fits</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Tutor profiles, details, and usual times</h3>
            </div>
            <Filter className="h-5 w-5 text-[#00C4B4]" />
          </div>

          <div className="mt-5 grid gap-4">
            {resultsReady && filteredTutors.length ? (
              filteredTutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} selected={selectedTutor === tutor.id} onSelect={() => setSelectedTutor(tutor.id)} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-900/15 bg-[#F0FDFA] p-5 text-sm text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                No tutor results yet. On the demo student version, the matching output will appear here automatically.
              </div>
            )}
          </div>

          {selectedDetails ? (
            <div className="mt-5 rounded-[1.5rem] border border-slate-900/10 bg-slate-950 p-5 text-white dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#CBFBF1]">Selected tutor</p>
                  <h4 className="mt-2 text-xl font-semibold">{selectedDetails.name}</h4>
                </div>
                <Star className="h-5 w-5 text-[#CBFBF1]" />
              </div>
              <p className="mt-3 text-sm leading-7 text-white/72">{selectedDetails.style}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedDetails.availability.map((slot) => (
                  <span key={slot} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/72">
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </section>
  )
}

function ActivitiesView({
  mode,
  workspace,
  setWorkspace,
}: {
  mode: DemoMode
  workspace: DemoWorkspaceState
  setWorkspace: React.Dispatch<React.SetStateAction<DemoWorkspaceState>>
}) {
  const [showRecommended, setShowRecommended] = useState(true)
  const [finderRunning, setFinderRunning] = useState(false)
  const [finderLines, setFinderLines] = useState<string[]>([])
  const [analysisRunning, setAnalysisRunning] = useState(false)
  const [analysisLines, setAnalysisLines] = useState<string[]>([])
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    workspace.activities.currentActivities[0]?.id || workspace.activities.activityRecommendations[0]?.id || null,
  )

  const currentActivities = workspace.activities.currentActivities
  const recommendations = workspace.activities.activityRecommendations

  function acceptGoal(goalId: string) {
    setWorkspace((current) => ({
      ...current,
      activities: {
        ...current.activities,
        recommendedGoals: current.activities.recommendedGoals.map((item) => (item.id === goalId ? { ...item, accepted: true } : item)),
      },
    }))
  }

  function rejectGoal(goalId: string) {
    setWorkspace((current) => ({
      ...current,
      activities: {
        ...current.activities,
        recommendedGoals: current.activities.recommendedGoals.map((item) => (item.id === goalId ? { ...item, hidden: true } : item)),
      },
    }))
  }

  function hideGoal(goalId: string) {
    setWorkspace((current) => ({
      ...current,
      activities: {
        ...current.activities,
        recommendedGoals: current.activities.recommendedGoals.map((item) => (item.id === goalId ? { ...item, hidden: true } : item)),
      },
    }))
  }

  useEffect(() => {
    if (!finderRunning) return
    const lines = [
      'Evaluating profile signals...',
      'Checking subject comfort and current workload...',
      'Comparing goals and target universities...',
      'Ranking activities by uniqueness and impact...',
    ]
    let index = 0
    setFinderLines([lines[0]])
    const interval = window.setInterval(() => {
      index += 1
      setFinderLines((current) => [...current.slice(-2), lines[index % lines.length]])
    }, 600)
    const finish = window.setTimeout(() => {
      window.clearInterval(interval)
      setFinderRunning(false)
      setWorkspace((current) =>
        resolveActivityFinderCompletion({
          mode,
          current,
          lines,
          recommendations,
        }).workspace,
      )
    }, 2200)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(finish)
    }
  }, [finderRunning, mode, recommendations, setWorkspace])

  useEffect(() => {
    if (!analysisRunning) return
    const lines = [
      'Evaluating non-negotiables...',
      'Commenting on activity uniqueness and impact...',
      'Checking whether the story understates or overstates the student...',
    ]
    let index = 0
    setAnalysisLines([lines[0]])
    const interval = window.setInterval(() => {
      index += 1
      setAnalysisLines((current) => [...current.slice(-2), lines[index % lines.length]])
    }, 700)
    const finish = window.setTimeout(() => {
      window.clearInterval(interval)
      setAnalysisRunning(false)
      if (mode === 'demo') {
        setWorkspace((current) => ({
          ...current,
          activities: {
            ...current.activities,
            analysis: {
              status: 'ready',
              log: lines,
              findings: [
                'Academic floor looks fine for the current target range.',
                'The robotics and tutoring work are the strongest uniqueness signals.',
                'Keep the story focused on a small number of high-impact commitments.',
              ],
              verdict: 'This profile can work if the student avoids scatter and documents impact clearly.',
              note: 'The biggest risk is adding generic activities that dilute the story.',
            },
          },
        }))
      } else {
        setWorkspace((current) => ({
          ...current,
          activities: {
            ...current.activities,
            analysis: {
              status: 'idle',
              log: [],
              findings: [],
              verdict: '',
              note: '',
            },
          },
        }))
      }
    }, 2300)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(finish)
    }
  }, [analysisRunning, mode, setWorkspace])

  function acceptRecommendation(activity: ActivityItem) {
    setWorkspace((current) => {
      const updated = current.activities.activityRecommendations.map((item) =>
        item.id === activity.id ? { ...item, accepted: true, rejected: false } : item,
      )
      return {
        ...current,
        activities: {
          ...current.activities,
          activityRecommendations: updated,
        },
      }
    })
    setSelectedActivityId(activity.id)
  }

  function rejectRecommendation(activity: ActivityItem, reason = '') {
    setWorkspace((current) => ({
      ...current,
      activities: {
        ...current.activities,
        activityRecommendations: current.activities.activityRecommendations.map((item) =>
          item.id === activity.id ? { ...item, rejected: true, accepted: false, rejectReason: reason } : item,
        ),
      },
    }))
  }

  function finalizeActivities() {
    const accepted = workspace.activities.activityRecommendations.filter((item) => item.accepted && !item.rejected)
    if (!accepted.length) return
    setWorkspace((current) => ({
      ...current,
      activities: {
        ...current.activities,
        currentActivities: [
          ...accepted.map((item, index) => ({
            ...item,
            notes: item.notes || 'Add notes after the activity starts.',
            commitment: item.commitment || '2 hrs/week',
          })),
          ...current.activities.currentActivities,
        ],
        activityRecommendations: current.activities.activityRecommendations.filter((item) => !item.accepted || item.rejected),
      },
      schedule: {
        ...current.schedule,
        recurringBlocks: [
          ...current.schedule.recurringBlocks,
          ...accepted.map((item, index) => ({
            id: `activity-${item.id}-${index}`,
            day: index % 2 === 0 ? 'Saturday' : 'Sunday',
            start: index % 2 === 0 ? '10:00' : '15:00',
            end: index % 2 === 0 ? '12:00' : '17:00',
            cadence: 'Weekly' as const,
            label: item.title,
          })),
        ],
      },
    }))
  }

  const selectedActivity =
    currentActivities.find((activity) => activity.id === selectedActivityId) ||
    recommendations.find((activity) => activity.id === selectedActivityId) ||
    currentActivities[0] ||
    recommendations[0] ||
    null

  return (
    <section className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
      <article className="space-y-5">
        <div className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Your goals</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Editable and visible to the rest of the product.</h2>
          <textarea
            value={workspace.profile.goalsNarrative}
            onChange={(event) =>
              setWorkspace((current) => ({
                ...current,
                profile: { ...current.profile, goalsNarrative: event.target.value },
              }))
            }
            rows={8}
            className="mt-4 w-full rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
            placeholder="Describe what you want to build, improve, or pursue."
          />
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setShowRecommended((value) => !value)}
              className="rounded-full border border-slate-900/10 bg-[#F0FDFA] px-4 py-2 font-semibold text-slate-700 hover:border-[#00C4B4]/40 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              {showRecommended ? 'Hide recommended goals section' : 'Show recommended goals section'}
            </button>
            <Link href="/settings" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 py-2 font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>

        {showRecommended ? (
          <div className="rounded-[2rem] border border-slate-900/10 bg-[#0A2540] p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#CBFBF1]">Recommended goals</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">Accept, reject, or hide for later.</h3>
              </div>
              <Target className="h-5 w-5 text-[#CBFBF1]" />
            </div>

            <div className="mt-5 space-y-3">
              {workspace.activities.recommendedGoals.length ? (
                workspace.activities.recommendedGoals
                  .filter((goal) => !goal.hidden)
                  .map((goal) => (
                    <div key={goal.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{goal.title}</p>
                          <p className="mt-2 text-sm leading-7 text-white/72">{goal.reason}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => acceptGoal(goal.id)}
                            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#0A2540]"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectGoal(goal.id)}
                            className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => hideGoal(goal.id)}
                            className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80"
                          >
                            Hide
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                  No recommended goals yet.
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Target universities</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Add universities or choose self-improvement only.</h3>
            </div>
            <button
              type="button"
              onClick={() =>
                setWorkspace((current) => ({
                  ...current,
                  activities: { ...current.activities, targetUniversities: [...current.activities.targetUniversities, ''] },
                }))
              }
              className="rounded-full border border-slate-900/10 bg-[#F0FDFA] px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#00C4B4]/40 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              Add university
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {workspace.activities.targetUniversities.length ? (
              workspace.activities.targetUniversities.map((uni, index) => (
                <div key={`${index}-${uni}`} className="flex gap-2">
                  <input
                    value={uni}
                    onChange={(event) =>
                      setWorkspace((current) => ({
                        ...current,
                        activities: {
                          ...current.activities,
                          targetUniversities: current.activities.targetUniversities.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item,
                          ),
                        },
                      }))
                    }
                    placeholder={index === 0 ? 'Undecided / not applicable / specific university' : 'Add another university'}
                    className="flex-1 rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setWorkspace((current) => ({
                        ...current,
                        activities: {
                          ...current.activities,
                          targetUniversities: current.activities.targetUniversities.filter((_, itemIndex) => itemIndex !== index),
                        },
                      }))
                    }
                    className="rounded-2xl border border-slate-900/10 bg-white px-3 py-3 text-slate-500 hover:text-rose-600 dark:border-white/10 dark:bg-slate-950/40 dark:hover:text-rose-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-900/15 bg-[#F0FDFA] p-4 text-sm text-slate-600 dark:border-white/15 dark:bg-slate-950/40 dark:text-slate-300">
                No target universities yet. You can leave this blank for self-improvement only.
              </div>
            )}
          </div>
        </div>
      </article>

      <aside className="space-y-5">
        <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#CBFBF1]">Activity finder</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Cycle through the profile and generate a plan.</h3>
            </div>
            <Sparkles className="h-5 w-5 text-[#CBFBF1]" />
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Run activity finder</p>
                <p className="text-sm text-white/65">Animation cycles through profile, goals, subject comfort, tutor feedback, and target universities.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFinderRunning(true)
                  if (mode === 'demo') {
                    setWorkspace((current) => ({
                      ...current,
                      activities: {
                        ...current.activities,
                        finderState: 'searching',
                      },
                    }))
                  }
                }}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0A2540]"
              >
                Run activity finder
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-white/75">
              {(finderRunning ? finderLines : workspace.activities.finderLog).map((line) => (
                <div key={line} className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse text-[#CBFBF1]" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {recommendations.length ? (
              recommendations.map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    'rounded-2xl border p-4 transition',
                    selectedActivityId === activity.id ? 'border-[#CBFBF1] bg-white/10' : 'border-white/10 bg-white/5',
                  )}
                  onClick={() => setSelectedActivityId(activity.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{activity.title}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/55">{activity.category}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75">
                      {activity.commitment}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-white/72">{activity.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => acceptRecommendation(activity)}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#0A2540]"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectRecommendation(activity)}
                      className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80"
                    >
                      Reject
                    </button>
                  </div>

                  {activity.rejected ? (
                    <textarea
                      value={activity.rejectReason}
                      onChange={(event) => rejectRecommendation(activity, event.target.value)}
                      placeholder="Why not?"
                      rows={2}
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/45"
                    />
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                No activity recommendations yet. Run the finder after the profile is filled in.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={finalizeActivities}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#00C4B4] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(0,196,180,.45)]"
          >
            Finalize
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">University-fit analysis</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Run your first analysis</h3>
            </div>
            <GraduationCap className="h-5 w-5 text-[#00C4B4]" />
          </div>

          <button
            type="button"
            onClick={() => {
              setAnalysisRunning(true)
              if (mode === 'demo') {
                setWorkspace((current) => ({
                  ...current,
                  activities: {
                    ...current.activities,
                    analysis: { ...current.activities.analysis, status: 'running' },
                  },
                }))
              }
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0A2540] px-5 py-3 text-sm font-semibold text-white"
          >
            <Sparkles className="h-4 w-4" />
            Run analysis
          </button>

          <div className="mt-4 space-y-2 rounded-2xl border border-slate-900/10 bg-[#F0FDFA] p-4 dark:border-white/10 dark:bg-slate-950/40">
            {(analysisRunning ? analysisLines : workspace.activities.analysis.log).map((line) => (
              <div key={line} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <Sparkles className="h-4 w-4 text-[#00C4B4]" />
                <span>{line}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {(analysisRunning ? [] : workspace.activities.analysis.findings).length ? (
              (analysisRunning ? [] : workspace.activities.analysis.findings).map((finding) => (
                <div key={finding} className="rounded-2xl border border-slate-900/10 bg-white p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200">
                  {finding}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-900/15 bg-white p-4 text-sm text-slate-600 dark:border-white/15 dark:bg-slate-950/40 dark:text-slate-300">
                No analysis run yet.
              </div>
            )}
          </div>

          {(analysisRunning ? '' : workspace.activities.analysis.verdict) ? (
            <div className="mt-4 rounded-2xl border border-[#CBFBF1] bg-[#F0FDFA] p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <p className="font-semibold text-slate-950 dark:text-white">What we believe</p>
              <p className="mt-2 leading-7">{analysisRunning ? '' : workspace.activities.analysis.verdict}</p>
              {workspace.activities.analysis.note ? <p className="mt-2 text-slate-500 dark:text-slate-400">{workspace.activities.analysis.note}</p> : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#CBFBF1]">Current activities</p>
          <div className="mt-4 space-y-3">
            {currentActivities.length ? (
              currentActivities.map((activity) => (
                <button
                  type="button"
                  key={activity.id}
                  onClick={() => setSelectedActivityId(activity.id)}
                  className={cn(
                    'w-full rounded-2xl border p-4 text-left transition',
                    selectedActivityId === activity.id ? 'border-[#CBFBF1] bg-white/10' : 'border-white/10 bg-white/5',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{activity.title}</p>
                      <p className="text-xs text-white/55">{activity.category}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75">
                      {activity.commitment}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-white/72">{activity.notes}</p>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Accepted activities will move here after you finalize the finder output.
              </div>
            )}
          </div>

            {selectedActivity ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">{selectedActivity.title}</p>
              <p className="mt-2 text-sm leading-7 text-white/72">{selectedActivity.details}</p>
              <textarea
                value={selectedActivity.notes}
                onChange={(event) =>
                  setWorkspace((current) => ({
                    ...current,
                    activities: {
                      ...current.activities,
                      currentActivities: current.activities.currentActivities.map((item) =>
                        item.id === selectedActivity.id ? { ...item, notes: event.target.value } : item,
                      ),
                      activityRecommendations: current.activities.activityRecommendations.map((item) =>
                        item.id === selectedActivity.id ? { ...item, notes: event.target.value } : item,
                      ),
                    },
                  }))
                }
                rows={3}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/45"
                placeholder="Take notes here while the student is doing the activity."
              />
            </div>
          ) : null}
        </div>
      </aside>
    </section>
  )
}

export function StudentWorkspaceSurface({ mode, view }: StudentWorkspaceSurfaceProps) {
  const router = useRouter()
  const [workspace, setWorkspace] = useState<DemoWorkspaceState>(() => createWorkspaceState(mode))
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = loadWorkspaceState(mode)
    setWorkspace(saved ? copyWorkspaceState(saved) : createWorkspaceState(mode))
    setLoaded(true)
  }, [mode])

  useEffect(() => {
    if (!loaded) return
    saveWorkspaceState(mode, workspace)
  }, [loaded, mode, workspace])

  const title = useMemo(() => VIEW_LABELS[view], [view])
  const displayMode = mode === 'demo' ? 'demo' : 'blank'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,196,180,.10),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(13,58,92,.10),_transparent_25%),linear-gradient(180deg,#f9fafb_0%,#ffffff_100%)] px-4 py-6 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <DemoHeader mode={displayMode} view={view} />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-slate-900/10 bg-white/90 px-5 py-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Section</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(displayMode === 'demo' ? '/student-dashboard' : '/demo')}
              className="rounded-full border border-slate-900/10 bg-[#F0FDFA] px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#00C4B4]/40 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
            >
              {displayMode === 'demo' ? 'Open blank profile' : 'Open demo student'}
            </button>
            <Link href="/settings" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>

        <main className="mt-5">
          {view === 'overview' ? <OverviewView mode={displayMode} workspace={workspace} setWorkspace={setWorkspace} /> : null}
          {view === 'tutoring' ? <TutoringView mode={displayMode} workspace={workspace} setWorkspace={setWorkspace} /> : null}
          {view === 'find-tutor' ? <TutorFinderView mode={displayMode} workspace={workspace} setWorkspace={setWorkspace} /> : null}
          {view === 'activities' ? <ActivitiesView mode={displayMode} workspace={workspace} setWorkspace={setWorkspace} /> : null}
        </main>
      </div>
    </div>
  )
}
