'use client'

import { signOut } from 'next-auth/react'
import { LogOut, Bell, Moon, Sun, Menu, Command } from 'lucide-react'
import { useTheme } from 'next-themes'

interface DashboardHeaderProps {
  user: { name?: string | null; email?: string | null }
  onMenu?: () => void
}

export default function DashboardHeader({ user, onMenu }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button onClick={onMenu} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu className="w-4 h-4" />
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, <span className="text-gray-900 dark:text-white font-medium">{user.name || 'Student'}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          className="hidden md:flex items-center gap-2 text-xs border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 rounded-lg text-gray-500"
          title="Command Palette"
        >
          <Command className="w-3.5 h-3.5" />
          Ctrl/Cmd + K
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Sign out</span>
        </button>
      </div>
    </header>
  )
}
