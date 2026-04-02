'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, ChevronDown, Plus, Search } from 'lucide-react'
import { useTutoringUi } from './TutoringDashboardShell'
import {
  initialStudents,
  initialsForName,
  nextSessionKey,
  progressColor,
  progressLabel,
  statusClasses,
  summaryClasses,
  tutoringStudentFilterOptions,
  tutoringStudentSortOptions,
  type FilterKey,
  type SortKey,
  type Student,
  type StudentStatus,
} from './tutoring-data'

type DraftStudent = {
  name: string
  subject: string
  grade: string
  sessions: string
  progress: string
  nextSession: string
  status: StudentStatus
}

function MenuButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex h-[34px] items-center gap-1 rounded-[8px] border px-[11px] py-[6px] text-[12px] font-medium transition-colors',
        active ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-[#E9ECEF] bg-white text-[#4A4A4A] hover:bg-[#F8F9FA]',
      ].join(' ')}
    >
      {label}
      <ChevronDown className="h-3.5 w-3.5" />
    </button>
  )
}

export default function TutoringStudentsPageClient() {
  const { activePov } = useTutoringUi()
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [query, setQuery] = useState('')
  const [filterKey, setFilterKey] = useState<FilterKey>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [selectedId, setSelectedId] = useState(initialStudents[0].id)
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [draft, setDraft] = useState<DraftStudent>({ name: '', subject: '', grade: '', sessions: '', progress: '', nextSession: '', status: 'Stable' })

  const visibleStudents = useMemo(() => {
    return students
      .filter((student) => {
        const needle = query.trim().toLowerCase()
        const matchesQuery = !needle || [student.name, student.subject, student.grade, student.nextSession, student.recap, student.note].join(' ').toLowerCase().includes(needle)
        const matchesFilter = filterKey === 'all' || (filterKey === 'improving' && student.status === 'Improving') || (filterKey === 'stable' && student.status === 'Stable') || (filterKey === 'declining' && student.status === 'Declining')
        return matchesQuery && matchesFilter
      })
      .sort((left, right) => {
        if (sortKey === 'progress') return right.progress - left.progress || left.name.localeCompare(right.name)
        if (sortKey === 'sessions') return right.sessions - left.sessions || left.name.localeCompare(right.name)
        if (sortKey === 'next') return nextSessionKey(left.nextSession) - nextSessionKey(right.nextSession) || left.name.localeCompare(right.name)
        return left.name.localeCompare(right.name)
      })
  }, [students, query, filterKey, sortKey])

  const selectedStudent = visibleStudents.find((student) => student.id === selectedId) ?? visibleStudents[0] ?? null
  const summaryStudents = visibleStudents.length > 0 ? visibleStudents : students
  const accelerating = summaryStudents.filter((student) => student.status === 'Improving').length
  const steady = summaryStudents.filter((student) => student.status === 'Stable').length
  const intervention = summaryStudents.filter((student) => student.status === 'Declining').length
  const averageProgress = summaryStudents.length > 0 ? (summaryStudents.reduce((sum, student) => sum + student.progress, 0) / summaryStudents.length).toFixed(1) : null

  const clearFilters = () => {
    setQuery('')
    setFilterKey('all')
    setSortKey('name')
    setFilterMenuOpen(false)
    setSortMenuOpen(false)
  }

  const submitStudentDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = draft.name.trim()
    if (!name) return

    const sessions = Math.max(0, Number.parseInt(draft.sessions, 10) || 0)
    const progress = Math.max(0, Math.min(100, Number.parseInt(draft.progress, 10) || 0))
    const id = `student-${Date.now()}`
    const nextStudent: Student = {
      id,
      initials: initialsForName(name),
      name,
      subject: draft.subject.trim() || 'Subject',
      grade: draft.grade.trim() || 'Grade',
      sessions,
      status: draft.status,
      progress,
      nextSession: draft.nextSession.trim() || 'TBD',
      recap: 'New student added from the tutoring dashboard.',
      note: 'Follow up with an intake recap and a first homework list.',
    }

    setStudents((current) => [nextStudent, ...current])
    setSelectedId(id)
    setDraft({ name: '', subject: '', grade: '', sessions: '', progress: '', nextSession: '', status: 'Stable' })
    setAddOpen(false)
  }

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.7px] text-[#9B9B9B]">Students</div>
          <div className="mt-1 font-display text-[20px] tracking-[-0.3px] text-[#1A1A1A]">Your current roster</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#4A4A4A]">
            <span className="rounded-full border border-[#E9ECEF] bg-white px-3 py-1">Viewing: {activePov}</span>
            <span className="rounded-full border border-[#E9ECEF] bg-white px-3 py-1">Showing: {visibleStudents.length} of {students.length}</span>
            {query || filterKey !== 'all' || sortKey !== 'name' ? (
              <button type="button" onClick={clearFilters} className="rounded-full border border-[#E9ECEF] bg-white px-3 py-1 text-[#DF5B30] transition-colors hover:bg-[#F8F9FA]">
                Clear filters
              </button>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-[8px] bg-[#3B82F6] px-[15px] py-[8px] text-[13px] font-medium text-white transition-colors hover:bg-[#60A5FA]"
          onClick={() => setAddOpen((current) => !current)}
        >
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      </section>

      {addOpen ? (
        <section className="rounded-[16px] border border-[#E9ECEF] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.7px] text-[#9B9B9B]">Quick add</div>
              <div className="mt-1 font-display text-[16px] tracking-[-0.3px] text-[#1A1A1A]">Add a new student locally</div>
            </div>
            <button type="button" onClick={() => setAddOpen(false)} className="rounded-full border border-[#E9ECEF] px-3 py-1.5 text-[12px] font-medium text-[#4A4A4A] transition-colors hover:bg-[#F8F9FA]">
              Hide
            </button>
          </div>

          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" onSubmit={submitStudentDraft}>
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">
              Name
              <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="rounded-[8px] border border-[#E9ECEF] px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]" placeholder="Student name" />
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">
              Subject
              <input value={draft.subject} onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))} className="rounded-[8px] border border-[#E9ECEF] px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]" placeholder="Physics" />
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">
              Grade
              <input value={draft.grade} onChange={(event) => setDraft((current) => ({ ...current, grade: event.target.value }))} className="rounded-[8px] border border-[#E9ECEF] px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]" placeholder="Grade 11" />
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">
              Sessions
              <input value={draft.sessions} onChange={(event) => setDraft((current) => ({ ...current, sessions: event.target.value }))} type="number" min="0" className="rounded-[8px] border border-[#E9ECEF] px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]" placeholder="12" />
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">
              Progress
              <input value={draft.progress} onChange={(event) => setDraft((current) => ({ ...current, progress: event.target.value }))} type="number" min="0" max="100" className="rounded-[8px] border border-[#E9ECEF] px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]" placeholder="72" />
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">
              Next session
              <input value={draft.nextSession} onChange={(event) => setDraft((current) => ({ ...current, nextSession: event.target.value }))} className="rounded-[8px] border border-[#E9ECEF] px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]" placeholder="Thu 4:00 PM" />
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">
              Status
              <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as StudentStatus }))} className="rounded-[8px] border border-[#E9ECEF] bg-white px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]">
                <option value="Improving">Improving</option>
                <option value="Stable">Stable</option>
                <option value="Declining">Declining</option>
              </select>
            </label>
            <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
              <button type="submit" className="inline-flex items-center gap-2 rounded-[8px] bg-[#3B82F6] px-[15px] py-[8px] text-[13px] font-medium text-white transition-colors hover:bg-[#60A5FA]">
                <Plus className="h-4 w-4" />
                Save Student
              </button>
              <button type="button" onClick={() => setAddOpen(false)} className="rounded-[8px] border border-[#E9ECEF] bg-white px-[15px] py-[8px] text-[13px] font-medium text-[#4A4A4A] transition-colors hover:bg-[#F8F9FA]">
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.45fr_.9fr]">
        <section className="overflow-hidden rounded-[16px] border border-[#E9ECEF] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E9ECEF] px-[18px] py-[15px]">
            <div className="font-display text-[14px] text-[#1E293B]">All Students ({visibleStudents.length})</div>
            <div className="flex items-center gap-[7px]">
              <div className="relative">
                <MenuButton label={`Filter: ${filterKey}`} active={filterMenuOpen} onClick={() => { setFilterMenuOpen((current) => !current); setSortMenuOpen(false) }} />
                {filterMenuOpen ? (
                  <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-[12px] border border-[#E9ECEF] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
                    {tutoringStudentFilterOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setFilterKey(option.key)
                          setFilterMenuOpen(false)
                        }}
                        className={[
                          'flex w-full items-center justify-between px-4 py-3 text-left text-[13px] transition-colors hover:bg-[#F8F9FA]',
                          filterKey === option.key ? 'font-semibold text-[#3B82F6]' : 'text-[#1E293B]',
                        ].join(' ')}
                      >
                        <span>{option.label}</span>
                        {filterKey === option.key ? <span className="text-[11px]">Selected</span> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="relative">
                <MenuButton label={`Sort: ${tutoringStudentSortOptions.find((option) => option.key === sortKey)?.label ?? 'name'}`} active={sortMenuOpen} onClick={() => { setSortMenuOpen((current) => !current); setFilterMenuOpen(false) }} />
                {sortMenuOpen ? (
                  <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-[12px] border border-[#E9ECEF] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
                    {tutoringStudentSortOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setSortKey(option.key)
                          setSortMenuOpen(false)
                        }}
                        className={[
                          'flex w-full items-center justify-between px-4 py-3 text-left text-[13px] transition-colors hover:bg-[#F8F9FA]',
                          sortKey === option.key ? 'font-semibold text-[#3B82F6]' : 'text-[#1E293B]',
                        ].join(' ')}
                      >
                        <span>{option.label}</span>
                        {sortKey === option.key ? <span className="text-[11px]">Selected</span> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA]">
                  {['Student', 'Subject', 'Grade', 'Sessions', 'Status', 'Progress', 'Next Session', ''].map((heading) => (
                    <th key={heading || 'actions'} className="px-[18px] py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.5px] text-[#9B9B9B]">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleStudents.length > 0 ? visibleStudents.map((student) => {
                  const isSelected = student.id === selectedStudent?.id

                  return (
                    <tr key={student.id} className={['border-t border-[#F8F9FA] transition-colors', isSelected ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8F9FA]'].join(' ')}>
                      <td className="px-[18px] py-[12px]">
                        <div className="flex items-center gap-[9px]">
                          <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-[11px] font-semibold" style={{ backgroundColor: `${student.status === 'Declining' ? '#EF4444' : student.status === 'Improving' ? '#10B981' : '#DF5B30'}18`, color: student.status === 'Declining' ? '#EF4444' : student.status === 'Improving' ? '#10B981' : '#DF5B30' }}>
                            {student.initials}
                          </div>
                          <button type="button" onClick={() => setSelectedId(student.id)} className="text-left text-[13.5px] font-medium text-[#1A1A1A] transition-colors hover:text-[#3B82F6]">
                            {student.name}
                          </button>
                        </div>
                      </td>
                      <td className="px-[18px] py-[12px]"><span className="inline-flex rounded-full bg-[#F8F9FA] px-3 py-1 text-[11px] font-medium text-[#1E293B]">{student.subject}</span></td>
                      <td className="px-[18px] py-[12px] text-[13px] text-[#6B6B6B]">{student.grade}</td>
                      <td className="px-[18px] py-[12px] text-[13.5px] font-medium text-[#1A1A1A]">{student.sessions}</td>
                      <td className="px-[18px] py-[12px]"><span className={['inline-flex rounded-full border px-[9px] py-[3px] text-[11px] font-semibold', statusClasses(student.status)].join(' ')}>{progressLabel(student.status)}</span></td>
                      <td className="px-[18px] py-[12px]">
                        <div className="flex items-center gap-2">
                          <div className="h-[5px] w-[70px] overflow-hidden rounded-full bg-[#E9ECEF]">
                            <div className="h-full rounded-full" style={{ width: `${student.progress}%`, backgroundColor: progressColor(student.progress) }} />
                          </div>
                          <span className="text-[11.5px] font-semibold text-[#4A4A4A]">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-[18px] py-[12px] text-[12.5px] font-medium text-[#DF5B30]">{student.nextSession}</td>
                      <td className="px-[12px] py-[12px]">
                        <button type="button" onClick={() => setSelectedId(student.id)} className="rounded-[8px] border border-[#E9ECEF] bg-white px-[11px] py-[6px] text-[12px] font-medium text-[#1E293B] transition-colors hover:bg-[#F8F9FA]">
                          View
                        </button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td className="px-[18px] py-[24px]" colSpan={8}>
                      <div className="rounded-[12px] border border-dashed border-[#E9ECEF] bg-[#F8F9FA] p-6 text-center">
                        <p className="text-[14px] font-semibold text-[#1E293B]">No students match the current filter.</p>
                        <p className="mt-1 text-[12px] text-[#6B6B6B]">Try a broader search or clear the filter to restore the full roster.</p>
                        <button type="button" onClick={clearFilters} className="mt-4 inline-flex items-center gap-2 rounded-[8px] bg-[#3B82F6] px-[15px] py-[8px] text-[13px] font-medium text-white transition-colors hover:bg-[#60A5FA]">
                          Reset view
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[8px] border border-[#E9ECEF] bg-white p-[10px]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.7px] text-[#9B9B9B]">Status summary</div>
            <div className="mt-3 space-y-3">
              {[
                { label: 'Accelerating', value: accelerating.toString(), tone: 'green' as const },
                { label: 'Steady', value: steady.toString(), tone: 'amber' as const },
                { label: 'Intervention Plan', value: intervention.toString(), tone: 'red' as const },
              ].map((item) => (
                <div key={item.label} className={['rounded-[8px] border p-[10px]', summaryClasses(item.tone)].join(' ')}>
                  <div className="text-[12px] font-semibold">{item.label}: {item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[8px] border border-[#E9ECEF] bg-white p-[10px]">
            <div className="text-[12px] font-semibold text-[#4A4A4A]">📊 Avg Progress</div>
            <div className="mt-1 text-[22px] font-bold text-[#3B82F6]">{averageProgress ? `${averageProgress}%` : '—'}</div>
            <div className="mt-1 text-[11px] text-[#6B6B6B]">Showing {visibleStudents.length} of {students.length} students</div>
          </div>

          <div className="rounded-[8px] border border-[#E9ECEF] bg-white p-[10px]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-[12px] font-semibold text-[#4A4A4A]">Selected student</div>
              {selectedStudent ? (
                <button type="button" onClick={() => setSelectedId(selectedStudent.id)} className="inline-flex items-center gap-1 rounded-full border border-[#E9ECEF] px-2 py-1 text-[11px] font-medium text-[#3B82F6]">
                  <ArrowRight className="h-3 w-3" />
                  Focus
                </button>
              ) : null}
            </div>

            {selectedStudent ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-[11px] font-semibold" style={{ backgroundColor: `${selectedStudent.status === 'Declining' ? '#EF4444' : selectedStudent.status === 'Improving' ? '#10B981' : '#DF5B30'}18`, color: selectedStudent.status === 'Declining' ? '#EF4444' : selectedStudent.status === 'Improving' ? '#10B981' : '#DF5B30' }}>
                    {selectedStudent.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#1A1A1A]">{selectedStudent.name}</div>
                    <div className="text-[11px] text-[#6B6B6B]">{selectedStudent.subject} · {selectedStudent.grade}</div>
                  </div>
                </div>

                <div className="rounded-[8px] border border-[#E9ECEF] bg-[#F8F9FA] p-3 text-[12px] leading-5 text-[#4A4A4A]">{selectedStudent.recap}</div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-[8px] border border-[#E9ECEF] bg-white p-2"><div className="text-[#9B9B9B]">Sessions</div><div className="mt-1 font-semibold text-[#1A1A1A]">{selectedStudent.sessions}</div></div>
                  <div className="rounded-[8px] border border-[#E9ECEF] bg-white p-2"><div className="text-[#9B9B9B]">Progress</div><div className="mt-1 font-semibold text-[#1A1A1A]">{selectedStudent.progress}%</div></div>
                  <div className="rounded-[8px] border border-[#E9ECEF] bg-white p-2"><div className="text-[#9B9B9B]">Status</div><div className="mt-1 font-semibold text-[#1A1A1A]">{progressLabel(selectedStudent.status)}</div></div>
                  <div className="rounded-[8px] border border-[#E9ECEF] bg-white p-2"><div className="text-[#9B9B9B]">Next</div><div className="mt-1 font-semibold text-[#1A1A1A]">{selectedStudent.nextSession}</div></div>
                </div>

                <div className="rounded-[8px] border border-[#E9ECEF] bg-white p-3 text-[12px] leading-5 text-[#4A4A4A]">
                  <span className="font-semibold text-[#1A1A1A]">Next note:</span> {selectedStudent.note}
                </div>
              </div>
            ) : (
              <p className="text-[12px] leading-5 text-[#6B6B6B]">No student matches the current filter. Clear the view or add a new student to continue.</p>
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}
