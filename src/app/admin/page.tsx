'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { Shield, Users, BookOpen, FileText } from 'lucide-react'

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3"><Shield className="w-8 h-8 text-orange-500" /> Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Platform management dashboard</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { label: 'Total Users', icon: Users, value: '-', color: 'text-blue-500' },
            { label: 'Study Materials', icon: BookOpen, value: '-', color: 'text-purple-500' },
            { label: 'Worksheets Created', icon: FileText, value: '-', color: 'text-green-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 text-center">Full admin functionality requires ADMIN role. Connect to database to see real stats.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
