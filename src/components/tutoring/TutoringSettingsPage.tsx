'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Save, Settings, User } from 'lucide-react'
import { useTutoringUi } from './TutoringDashboardShell'
import { tutoringPovItems } from './tutoring-data'

export default function TutoringSettingsPage() {
  const { activePov, setActivePov } = useTutoringUi()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    tutorName: 'James Chen',
    emailReports: true,
    smsReminders: false,
    defaultSubject: 'Physics',
    signature: 'James Chen · Tutor',
  })

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
      <section className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">
            <Settings className="h-3.5 w-3.5" />
            Settings
          </div>
          <h1 className="font-display mt-4 text-3xl tracking-tight text-slate-950">Tutor preferences and workspace options</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            This page keeps the tutoring workspace configurable while the main ElevateOS dashboard stays separate.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            <User className="h-4 w-4" />
            Profile
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Tutor name</span>
            <input value={form.tutorName} onChange={(event) => setForm((current) => ({ ...current, tutorName: event.target.value }))} className="w-full rounded-[0.9rem] border border-slate-900/10 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#3B82F6]" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center justify-between gap-3 rounded-[1rem] border border-slate-900/10 px-4 py-3">
              <span className="text-sm text-slate-700">Email recaps</span>
              <input type="checkbox" checked={form.emailReports} onChange={(event) => setForm((current) => ({ ...current, emailReports: event.target.checked }))} className="h-4 w-4 accent-[#3B82F6]" />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-[1rem] border border-slate-900/10 px-4 py-3">
              <span className="text-sm text-slate-700">SMS reminders</span>
              <input type="checkbox" checked={form.smsReminders} onChange={(event) => setForm((current) => ({ ...current, smsReminders: event.target.checked }))} className="h-4 w-4 accent-[#3B82F6]" />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Default subject focus</span>
            <input value={form.defaultSubject} onChange={(event) => setForm((current) => ({ ...current, defaultSubject: event.target.value }))} className="w-full rounded-[0.9rem] border border-slate-900/10 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#3B82F6]" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email signature</span>
            <textarea value={form.signature} onChange={(event) => setForm((current) => ({ ...current, signature: event.target.value }))} rows={4} className="w-full rounded-[0.9rem] border border-slate-900/10 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#3B82F6]" />
          </label>

          <button type="submit" className="inline-flex items-center gap-2 rounded-[0.9rem] bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#60A5FA]">
            <Save className="h-4 w-4" />
            Save settings
          </button>
          {saved ? <p className="text-sm text-emerald-700">Settings saved locally.</p> : null}
        </form>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[1.25rem] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/10">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c06d]">Default POV</div>
          <p className="mt-3 text-sm leading-7 text-white/75">Use the sidebar POV buttons to switch the tutoring experience. Current state: {activePov}.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tutoringPovItems.map((pov) => (
              <button
                key={pov}
                type="button"
                onClick={() => setActivePov(pov)}
                className={[
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  pov === activePov ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10',
                ].join(' ')}
              >
                {pov}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace notes</div>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <li>• Live hosting and deployment happen outside this page.</li>
            <li>• Backend-only infrastructure details stay out of the public UI.</li>
            <li>• Each sidebar item now has a dedicated route.</li>
          </ul>
          <Link href="/auth/login" className="mt-4 inline-flex items-center gap-2 rounded-[0.9rem] border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-[#f8f5ef]">
            Sign out
          </Link>
        </div>
      </aside>
    </div>
  )
}
