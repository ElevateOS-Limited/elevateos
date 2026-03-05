'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import DashboardHeader from '@/components/layout/DashboardHeader'
import ChatBot from '@/components/dashboard/ChatBot'
import CommandPalette from '@/components/layout/CommandPalette'

export default function DashboardShell({ user, children }: { user: any; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar user={user} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.10),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(14,165,233,0.10),transparent_30%)]" />
        <DashboardHeader user={user} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6 py-6">{children}</div>
        </main>
      </div>
      <ChatBot />
      <CommandPalette />
    </div>
  )
}
