import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  Bell,
  CalendarClock,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Users,
  TrendingUp,
} from 'lucide-react'

import type { LucideIcon } from 'lucide-react'
import { getSiteVariantFromHeaders } from '@/lib/site'

type NavItem = {
  id: string
  label: string
  icon: LucideIcon
  badge?: number
}

type StudentRow = {
  initials: string
  name: string
  subject: string
  grade: string
  sessions: number
  status: 'Improving' | 'Stable' | 'Declining'
  progress: number
  nextSession: string
}

type SummaryRow = {
  label: string
  value: string
  tone: 'green' | 'amber' | 'red'
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'recaps', label: 'Recaps', icon: FileText },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'schedule', label: 'Schedule', icon: CalendarClock },
  { id: 'communication', label: 'Communication', icon: MessageSquare, badge: 3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const povItems = ['Demo POV', 'Tutor POV', 'Parent POV'] as const

const students: StudentRow[] = [
  { initials: 'AS', name: 'Aiko Sato', subject: 'Physics', grade: 'Grade 12', sessions: 31, status: 'Improving', progress: 93, nextSession: 'Thu 3:00 PM' },
  { initials: 'HK', name: 'Hana Kobayashi', subject: 'Biology', grade: 'Grade 11', sessions: 9, status: 'Stable', progress: 68, nextSession: 'Mon 6:00 PM' },
  { initials: 'KY', name: 'Kenji Yamamoto', subject: 'Chemistry', grade: 'Grade 10', sessions: 12, status: 'Declining', progress: 48, nextSession: 'Fri 2:00 PM' },
  { initials: 'LM', name: 'Lucia Martinez', subject: 'Essay Writing', grade: 'Grade 11', sessions: 16, status: 'Declining', progress: 52, nextSession: 'Sat 10:00 AM' },
  { initials: 'MP', name: 'Mina Park', subject: 'Algebra II', grade: 'Grade 9', sessions: 14, status: 'Improving', progress: 76, nextSession: 'Tue 4:30 PM' },
  { initials: 'NW', name: 'Noah Williams', subject: 'Pre-Calculus', grade: 'Grade 12', sessions: 20, status: 'Stable', progress: 74, nextSession: 'Sun 3:00 PM' },
  { initials: 'OH', name: 'Omar Hassan', subject: 'World History', grade: 'Grade 10', sessions: 11, status: 'Stable', progress: 61, nextSession: 'Thu 5:00 PM' },
  { initials: 'RN', name: 'Ryo Nakamura', subject: 'English', grade: 'Grade 11', sessions: 18, status: 'Declining', progress: 59, nextSession: 'Wed 5:30 PM' },
  { initials: 'YT', name: 'Yuki Tanaka', subject: 'Mathematics', grade: 'Grade 10', sessions: 24, status: 'Improving', progress: 82, nextSession: 'Mon 4:00 PM' },
]

const statusSummary: SummaryRow[] = [
  { label: 'Accelerating', value: '3', tone: 'green' },
  { label: 'Steady', value: '3', tone: 'amber' },
  { label: 'Intervention Plan', value: '3', tone: 'red' },
]

function statusClasses(status: StudentRow['status']) {
  if (status === 'Improving') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
  }

  if (status === 'Declining') {
    return 'border-rose-500/20 bg-rose-500/10 text-rose-700'
  }

  return 'border-amber-500/20 bg-amber-500/10 text-amber-700'
}

function summaryClasses(tone: SummaryRow['tone']) {
  if (tone === 'green') {
    return 'border-[#A7F3D0] bg-[#E6F4ED] text-[#2D6A4F]'
  }

  if (tone === 'red') {
    return 'border-[#FECACA] bg-[#FEE2E2] text-[#991B1B]'
  }

  return 'border-[#FDE68A] bg-[#FEF3C7] text-[#92400E]'
}

function progressColor(progress: number) {
  if (progress >= 75) return '#10B981'
  if (progress >= 50) return '#3B82F6'
  return '#EF4444'
}

function progressLabel(status: StudentRow['status']) {
  if (status === 'Improving') return '📈 Improving'
  if (status === 'Declining') return '📉 Declining'
  return '→ Stable'
}

export default async function TutorDashboardPage() {
  const headerStore = await headers()
  if (getSiteVariantFromHeaders(headerStore) !== 'tutoring') {
    redirect('/dashboard')
  }

  return (
    <div className="relative flex min-h-[100svh] overflow-hidden bg-[#1E293B] text-[#F8F9FA]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(223,91,48,0.08),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.03),transparent_24%)]" />

      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-[#334155] bg-[#1E293B] lg:flex">
        <div className="flex items-center gap-2 border-b border-[#F8F9FA] px-5 py-[21px] pb-[18px]">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] bg-[#DF5B30] font-display text-[15px] text-white">
            E
          </div>
          <span className="font-display text-[16.5px] tracking-[-0.3px] text-[#F8F9FA]">
            ElevateOS
          </span>
        </div>

        <div className="flex items-center gap-2 border-b border-[#F8F9FA] px-5 py-[13px]">
          <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#DF5B30]/20 text-[11px] font-semibold text-[#DF5B30]">
            JC
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-[#F8F9FA]">James Chen</div>
            <div className="text-[11px] text-[#F8F9FA]/70">Tutor</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-[10px] py-[10px]">
          <div className="mb-[3px] mt-3 px-[10px] text-[10px] font-semibold uppercase tracking-[0.9px] text-[#9B9B9B]">
            Main
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = item.id === 'students'

            return (
              <button
                key={item.id}
                type="button"
                className={[
                  'mb-px flex w-full items-center gap-[9px] rounded-[8px] px-[10px] py-[8.5px] text-[13px] font-[450] transition-colors',
                  active ? 'bg-[#EFF6FF] text-[#3B82F6]' : 'text-[#F8F9FA] hover:bg-[#334155]',
                ].join(' ')}
              >
                <Icon className="h-[15px] w-[15px] shrink-0 opacity-60" />
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="ml-auto rounded-full bg-[#DF5B30] px-[6px] py-[2px] text-[9.5px] font-semibold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-[#F8F9FA] px-[10px] py-[12px]">
          <div className="mb-3 rounded-[12px] border border-[#334155] bg-[#111827] p-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.7px] text-[#9B9B9B]">
              POV
            </div>
            <div className="flex flex-col gap-2">
              {povItems.map((label) => {
                const active = label === 'Tutor POV'
                return (
                  <button
                    key={label}
                    type="button"
                    className={[
                      'rounded-[8px] border px-3 py-2 text-left text-[12px] font-medium transition-colors',
                      active
                        ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]'
                        : 'border-[#334155] bg-[#1E293B] text-[#F8F9FA] hover:bg-[#334155]',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <Link
            href="/auth/login"
            className="flex items-center gap-[9px] rounded-[8px] px-[10px] py-[8.5px] text-[13px] font-[450] text-[#F8F9FA] transition-colors hover:bg-[#334155]"
          >
            <LogOut className="h-[15px] w-[15px] shrink-0 opacity-60" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[58px] shrink-0 items-center gap-3 border-b border-[#334155] bg-[#1E293B] px-6">
          <button
            type="button"
            className="mr-1 rounded-[6px] p-2 text-[#F8F9FA] transition-colors hover:bg-[#334155] lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="font-display flex-1 text-[18px] tracking-[-0.3px] text-[#F8F9FA]">
            Students
          </div>

          <label className="hidden w-[220px] items-center gap-[7px] rounded-[8px] border border-[#E9ECEF] bg-[#F8F9FA] px-[11px] py-[6px] text-[#6B6B6B] focus-within:border-[#DF5B30] lg:flex">
            <Search className="h-[13px] w-[13px] shrink-0 text-[#9B9B9B]" />
            <input
              className="w-full bg-transparent text-[13px] text-[#1A1A1A] outline-none placeholder:text-[#9B9B9B]"
              placeholder="Search students, sessions…"
              aria-label="Search students and sessions"
            />
          </label>

          <div className="flex items-center gap-[7px]">
            <button
              type="button"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#E9ECEF] bg-[#F8F9FA] text-[#6B6B6B] transition-colors hover:bg-[#E9ECEF] hover:text-[#1A1A1A]"
              aria-label="Create new item"
            >
              <Plus className="h-[14px] w-[14px]" />
            </button>
            <button
              type="button"
              className="relative flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#E9ECEF] bg-[#F8F9FA] text-[#6B6B6B] transition-colors hover:bg-[#E9ECEF] hover:text-[#1A1A1A]"
              aria-label="Notifications"
            >
              <Bell className="h-[14px] w-[14px]" />
              <span className="absolute right-[5px] top-[5px] h-[6px] w-[6px] rounded-full border border-[#F1F3F4] bg-[#DF5B30]" />
            </button>
          </div>
        </header>

        <div className="flex min-w-0 flex-1 overflow-hidden bg-[#F8F9FA]">
          <main className="min-w-0 flex-1 overflow-y-auto p-6">
            <section className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.7px] text-[#9B9B9B]">
                  Students
                </div>
                <div className="mt-1 font-display text-[20px] tracking-[-0.3px] text-[#1A1A1A]">
                  Your current roster
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[8px] bg-[#3B82F6] px-[15px] py-[8px] text-[13px] font-medium text-white transition-colors hover:bg-[#60A5FA]"
              >
                <Plus className="h-4 w-4" />
                Add Student
              </button>
            </section>

            <section className="overflow-hidden rounded-[16px] border border-[#E9ECEF] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between border-b border-[#E9ECEF] px-[18px] py-[15px]">
                <div className="font-display text-[14px] text-[#1E293B]">
                  All Students ({students.length})
                </div>

                <div className="flex items-center gap-[7px]">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-[8px] border border-[#E9ECEF] bg-white px-[11px] py-[6px] text-[12px] font-medium text-[#4A4A4A] transition-colors hover:bg-[#F8F9FA]"
                  >
                    Filter: all
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-[8px] border border-[#E9ECEF] bg-white px-[11px] py-[6px] text-[12px] font-medium text-[#4A4A4A] transition-colors hover:bg-[#F8F9FA]"
                  >
                    Sort: name
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA]">
                      {['Student', 'Subject', 'Grade', 'Sessions', 'Status', 'Progress', 'Next Session', ''].map(
                        (heading) => (
                          <th
                            key={heading || 'actions'}
                            className="px-[18px] py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.5px] text-[#9B9B9B]"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student.name}
                        className="border-t border-[#F8F9FA] transition-colors hover:bg-[#F8F9FA]"
                      >
                        <td className="px-[18px] py-[12px]">
                          <div className="flex items-center gap-[9px]">
                            <div
                              className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-[11px] font-semibold"
                              style={{
                                backgroundColor: `${student.status === 'Declining' ? '#EF4444' : student.status === 'Improving' ? '#10B981' : '#DF5B30'}18`,
                                color: student.status === 'Declining' ? '#EF4444' : student.status === 'Improving' ? '#10B981' : '#DF5B30',
                              }}
                            >
                              {student.initials}
                            </div>
                            <span className="text-[13.5px] font-medium text-[#1A1A1A]">
                              {student.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-[18px] py-[12px]">
                          <span className="inline-flex rounded-full bg-[#F8F9FA] px-3 py-1 text-[11px] font-medium text-[#1E293B]">
                            {student.subject}
                          </span>
                        </td>

                        <td className="px-[18px] py-[12px] text-[13px] text-[#6B6B6B]">
                          {student.grade}
                        </td>

                        <td className="px-[18px] py-[12px] text-[13.5px] font-medium text-[#1A1A1A]">
                          {student.sessions}
                        </td>

                        <td className="px-[18px] py-[12px]">
                          <span
                            className={[
                              'inline-flex rounded-full border px-[9px] py-[3px] text-[11px] font-semibold',
                              statusClasses(student.status),
                            ].join(' ')}
                          >
                            {progressLabel(student.status)}
                          </span>
                        </td>

                        <td className="px-[18px] py-[12px]">
                          <div className="flex items-center gap-2">
                            <div className="h-[5px] w-[70px] overflow-hidden rounded-full bg-[#E9ECEF]">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${student.progress}%`,
                                  backgroundColor: progressColor(student.progress),
                                }}
                              />
                            </div>
                            <span className="text-[11.5px] font-semibold text-[#4A4A4A]">
                              {student.progress}%
                            </span>
                          </div>
                        </td>

                        <td className="px-[18px] py-[12px] text-[12.5px] font-medium text-[#DF5B30]">
                          {student.nextSession}
                        </td>

                        <td className="px-[12px] py-[12px]">
                          <button
                            type="button"
                            className="rounded-[8px] border border-[#E9ECEF] bg-white px-[11px] py-[6px] text-[12px] font-medium text-[#1E293B] transition-colors hover:bg-[#F8F9FA]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>

          <aside className="hidden w-[272px] shrink-0 overflow-y-auto border-l border-[#E9ECEF] bg-[#F1F3F4] p-5 xl:block">
            <div className="mb-6">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.7px] text-[#9B9B9B]">
                Status Summary
              </div>
              <div className="space-y-3">
                {statusSummary.map((item) => (
                  <div
                    key={item.label}
                    className={[
                      'rounded-[8px] border p-[10px]',
                      summaryClasses(item.tone),
                    ].join(' ')}
                  >
                    <div className="text-[12px] font-semibold">
                      {item.label}: {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[8px] border border-[#E9ECEF] bg-white p-[10px]">
              <div className="text-[12px] font-semibold text-[#4A4A4A]">
                📊 Avg Progress
              </div>
              <div className="mt-1 text-[22px] font-bold text-[#3B82F6]">
                68.1%
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
