'use client'

import Image from 'next/image'
import Link from 'next/link'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, Search, Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getTutoringNavId,
  isTutorPov,
  tutoringNavItems,
  tutoringPovItems,
  tutoringSectionMeta,
  type TutoringNavId,
  type TutoringPov,
} from './tutoring-data'

type TutoringUiContextValue = {
  activePov: TutoringPov
  setActivePov: (value: TutoringPov) => void
  activeNav: TutoringNavId
}

const TutoringUiContext = createContext<TutoringUiContextValue | null>(null)

export function useTutoringUi() {
  const value = useContext(TutoringUiContext)

  if (!value) {
    throw new Error('useTutoringUi must be used inside TutoringDashboardShell')
  }

  return value
}

function TutoringSidebar({
  activeNav,
  activePov,
  mobile = false,
  onClose,
  onSetActivePov,
}: {
  activeNav: TutoringNavId
  activePov: TutoringPov
  mobile?: boolean
  onClose: () => void
  onSetActivePov: (value: TutoringPov) => void
}) {
  const [search, setSearch] = useState('')
  const visibleNavItems = useMemo(() => {
    const items = tutoringNavItems.filter((item) => isTutorPov(activePov) || item.id !== 'students')

    if (!search.trim()) {
      return items
    }

    const query = search.toLowerCase()
    return items.filter((item) => item.label.toLowerCase().includes(query) || item.href.toLowerCase().includes(query))
  }, [activePov, search])

  return (
    <div className={cn('flex h-full flex-col bg-[linear-gradient(180deg,#0A2540_0%,#0D3A5C_100%)] text-white', mobile ? 'w-[84vw] max-w-[300px]' : 'w-[286px]')}>
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white shadow-lg shadow-black/10">
            <Image src="/logo-mark.svg" alt="ElevateOS" width={40} height={40} className="h-8 w-8 object-contain" />
          </div>
          <div className="min-w-0">
            <Image src="/logo-lockup-horizontal.svg" alt="ElevateOS" width={180} height={52} className="h-8 w-auto" priority />
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Tutoring workspace</p>
          </div>
        </Link>

        <button
          type="button"
          className="ml-auto rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-white/10 px-4 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search modules..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#00C4B4]/60 focus:bg-white/10"
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-xs font-medium text-white/65 underline decoration-white/25 decoration-dotted underline-offset-4 hover:text-white"
          >
            Show quick actions
          </button>
          <Link href="/dashboard/settings" onClick={onClose} className="text-xs font-medium text-[#CBFBF1] hover:text-white">
            Upgrade →
          </Link>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">Main</div>
        <div className="space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const active = item.id === activeNav

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-medium transition-all',
                  active ? 'bg-white text-[#0A2540] shadow-lg shadow-black/10' : 'text-white/78 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#00C4B4]' : 'text-white/55')} />
                <span className="truncate">{item.label}</span>
                {item.badge ? <span className={cn('ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold', active ? 'bg-[#F0FDFA] text-[#0E5060]' : 'bg-[#00C4B4] text-white')}>{item.badge}</span> : null}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">View</div>
          <div className="grid gap-2">
            {tutoringPovItems.map((label) => {
              const isActive = label === activePov

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onSetActivePov(label)}
                  className={cn(
                    'rounded-2xl border px-3 py-2 text-left text-[12px] font-medium transition-all',
                    isActive ? 'border-[#CBFBF1] bg-white text-[#0A2540]' : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10',
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <Link
          href="/auth/login"
          onClick={onClose}
          className="mt-3 flex items-center gap-2 rounded-2xl px-3 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign out</span>
        </Link>
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="rounded-[1.25rem] border border-[#CBFBF1]/20 bg-[linear-gradient(135deg,#0A2540_0%,#0D3A5C_60%,#0E5060_100%)] p-3 text-white shadow-lg shadow-black/10">
          <p className="text-sm font-semibold">ElevateOS tutoring</p>
          <p className="mt-1 text-xs leading-5 text-white/75">Shared design language across tutoring, counselling, and planning.</p>
        </div>
      </div>
    </div>
  )
}

export default function TutoringDashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activePov, setActivePov] = useState<TutoringPov>('Tutor')

  const activeNav = useMemo(() => getTutoringNavId(pathname), [pathname])
  const section = tutoringSectionMeta[activeNav]
  const povLabel = activePov

  return (
    <TutoringUiContext.Provider value={{ activePov, setActivePov, activeNav }}>
      <div className="relative flex min-h-[100svh] overflow-hidden bg-[#F9FAFB] text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(0,196,180,0.12),transparent_28%),radial-gradient(circle_at_90%_18%,rgba(10,37,64,0.08),transparent_26%)]" />

        <aside className="hidden shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,#0A2540_0%,#0D3A5C_100%)] lg:flex">
          <TutoringSidebar
            activeNav={activeNav}
            activePov={activePov}
            onClose={() => setMobileOpen(false)}
            onSetActivePov={setActivePov}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center gap-3 border-b border-slate-900/10 bg-white/90 px-4 backdrop-blur-xl md:px-6">
            <button
              type="button"
              className="rounded-full p-2 text-slate-700 transition-colors hover:bg-[#F0FDFA] hover:text-slate-950 lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">{section.description}</div>
              <div className="mt-1 text-[18px] font-semibold tracking-tight text-slate-950">{section.title}</div>
            </div>

            <Link
              href="/dashboard/settings"
              className="hidden items-center gap-2 rounded-full border border-slate-900/10 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#00C4B4]/40 hover:text-slate-950 md:inline-flex"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-[#CBFBF1] bg-[#F0FDFA] px-3 py-2 text-sm font-semibold text-[#0E5060] md:inline-flex">
              <span className="h-2 w-2 rounded-full bg-[#00C4B4]" />
              {povLabel}
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto bg-[#F9FAFB] p-4 text-slate-900 md:p-6">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/60"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative flex h-full flex-col overflow-y-auto">
              <div className="flex items-center justify-end px-4 py-3 bg-[linear-gradient(180deg,#0A2540_0%,#0D3A5C_100%)]">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-2 text-white transition-colors hover:bg-white/10"
                  aria-label="Close navigation panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <TutoringSidebar
                activeNav={activeNav}
                activePov={activePov}
                mobile
                onClose={() => setMobileOpen(false)}
                onSetActivePov={setActivePov}
              />
            </aside>
          </div>
        ) : null}
      </div>
    </TutoringUiContext.Provider>
  )
}
