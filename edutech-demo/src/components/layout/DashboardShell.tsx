'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import DashboardHeader from '@/components/layout/DashboardHeader'
import ChatBot from '@/components/dashboard/ChatBot'
import CommandPalette from '@/components/layout/CommandPalette'

export default function DashboardShell({ user, children }: { user: any; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar user={user} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <ChatBot />
      <CommandPalette />
    </div>
  )
}
