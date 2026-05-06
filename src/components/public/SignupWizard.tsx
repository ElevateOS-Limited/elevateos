'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import {
  A_LEVEL_SUBJECT_BANK,
  CURRICULUM_OPTIONS,
  FUTURE_PATH_OPTIONS,
  GRADE_OPTIONS,
  HOURS_RANGE_OPTIONS,
  IGCSE_SUBJECT_BANK,
  IB_SUBJECT_BANK,
  NATIONALITIES_NOTE,
  WEEK_DAYS,
  createSubjectSlots,
  createWorkspaceState,
  getCurriculumSubjectBank,
  getMonthGrid,
  saveWorkspaceState,
  toIsoDate,
  type CurriculumChoice,
  type DemoMode,
  type DemoWorkspaceState,
  type ScheduleBlock,
  type SubjectSlot,
} from '@/lib/demo/student-flow'

type SignupWizardProps = {
  initialMode: DemoMode
}

const STORAGE_KEY_PREFIX = 'elevateos.signup.wizard'

function getWizardStorageKey(mode: DemoMode) {
  return `${STORAGE_KEY_PREFIX}.${mode}`
}

function loadWizardDraft(mode: DemoMode): DemoWorkspaceState | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(getWizardStorageKey(mode))
  if (!raw) return null
  try {
    return JSON.parse(raw) as DemoWorkspaceState
  } catch {
    return null
  }
}

function saveWizardDraft(mode: DemoMode, state: DemoWorkspaceState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getWizardStorageKey(mode), JSON.stringify(state))
}

function createUniqueId(prefix: string) {
  const randomId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `${prefix}-${randomId}`
}

function countSelectedSubjects(subjects: SubjectSlot[]) {
  return subjects.filter((subject) => subject.subject.trim()).length
}

function countIbHl(subjects: SubjectSlot[]) {
  return subjects.filter((subject) => subject.subject.trim() && subject.level === 'HL').length
}

function countUniqueSelectedSubjects(subjects: SubjectSlot[]) {
  return new Set(subjects.map((subject) => subject.subject.trim()).filter(Boolean)).size
}

function makeScheduleBlock(): ScheduleBlock {
  return {
    id: createUniqueId('block'),
    day: 'Monday',
    start: '17:00',
    end: '18:00',
    cadence: 'Weekly',
    label: '',
  }
}

export function SignupWizard({ initialMode }: SignupWizardProps) {
  const router = useRouter()
  const [mode, setMode] = useState<DemoMode>(initialMode)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [workspace, setWorkspace] = useState<DemoWorkspaceState>(() => createWorkspaceState(initialMode))
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [didLoadDraft, setDidLoadDraft] = useState(false)

  useEffect(() => {
    const saved = loadWizardDraft(mode)
    if (saved) {
      setWorkspace(saved)
    } else {
      setWorkspace(createWorkspaceState(mode))
    }
    setDidLoadDraft(true)
  }, [mode])

  useEffect(() => {
    if (!didLoadDraft) return
    saveWizardDraft(mode, workspace)
  }, [didLoadDraft, mode, workspace])

  const subjectRequirement = useMemo(() => {
    if (workspace.profile.curriculum === 'IB') {
      return { total: 6, hl: 3, label: '6 subjects with at least 3 HL' }
    }
    if (workspace.profile.curriculum === 'A-levels') {
      return { total: 3, hl: 0, label: 'At least 3 subjects' }
    }
    if (workspace.profile.curriculum === 'IGCSE') {
      return { total: 0, hl: 0, label: 'No minimum subject requirement' }
    }
    return { total: 0, hl: 0, label: 'Choose a curriculum first' }
  }, [workspace.profile.curriculum])

  const subjectProgress = countSelectedSubjects(workspace.subjects)
  const hlProgress = countIbHl(workspace.subjects)
  const hasDuplicateSubjects = subjectProgress > countUniqueSelectedSubjects(workspace.subjects)
  const isIb = workspace.profile.curriculum === 'IB'
  const isALevels = workspace.profile.curriculum === 'A-levels'
  const isIgcse = workspace.profile.curriculum === 'IGCSE'

  const nextMonthGrid = getMonthGrid(calendarMonth)

  function setCurriculum(curriculum: CurriculumChoice) {
    setWorkspace((current) => ({
      ...current,
      profile: {
        ...current.profile,
        curriculum,
        futurePath: curriculum === 'IGCSE' ? current.profile.futurePath : '',
      },
      subjects: createSubjectSlots(curriculum, current.mode),
    }))
  }

  function updateSubject(index: number, patch: Partial<SubjectSlot>) {
    setWorkspace((current) => ({
      ...current,
      subjects: current.subjects.map((subject, subjectIndex) => (subjectIndex === index ? { ...subject, ...patch } : subject)),
    }))
  }

  function addIgcseSubject() {
    setWorkspace((current) => ({
      ...current,
      subjects: [...current.subjects, { id: createUniqueId('igcse-slot'), subject: '', level: '', confidence: null }],
    }))
  }

  function removeIgcseSubject(index: number) {
    setWorkspace((current) => ({
      ...current,
      subjects: current.subjects.filter((_, subjectIndex) => subjectIndex !== index),
    }))
  }

  function toggleBlockedDate(isoDate: string) {
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

  function updateRecurringBlock(index: number, patch: Partial<ScheduleBlock>) {
    setWorkspace((current) => ({
      ...current,
      schedule: {
        ...current.schedule,
        recurringBlocks: current.schedule.recurringBlocks.map((block, blockIndex) => (blockIndex === index ? { ...block, ...patch } : block)),
      },
    }))
  }

  function addRecurringBlock() {
    setWorkspace((current) => ({
      ...current,
      schedule: {
        ...current.schedule,
        recurringBlocks: [...current.schedule.recurringBlocks, makeScheduleBlock()],
      },
    }))
  }

  function removeRecurringBlock(index: number) {
    setWorkspace((current) => ({
      ...current,
      schedule: {
        ...current.schedule,
        recurringBlocks: current.schedule.recurringBlocks.filter((_, blockIndex) => blockIndex !== index),
      },
    }))
  }

  function resetDraft(nextMode: DemoMode) {
    setMode(nextMode)
    setStep(1)
    setWorkspace(createWorkspaceState(nextMode))
    const nextMonth = new Date()
    setCalendarMonth(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1))
  }

  async function completeSignup() {
    if (!workspace.profile.privacyAccepted) return
    setLoading(true)
    try {
      saveWorkspaceState(mode, workspace)
      saveWizardDraft(mode, workspace)
      router.push(mode === 'demo' ? '/student-dashboard?mode=demo' : '/student-dashboard')
    } finally {
      setLoading(false)
    }
  }

  const canContinueStepOne =
    workspace.profile.country.trim() &&
    workspace.profile.age.trim() &&
    workspace.profile.grade.trim() &&
    workspace.profile.curriculum.trim()
  const canContinueStepTwo =
    workspace.profile.curriculum === 'IB'
      ? subjectProgress >= 6 && hlProgress >= 3 && !hasDuplicateSubjects
      : workspace.profile.curriculum === 'A-levels'
        ? subjectProgress >= 3 && !hasDuplicateSubjects
          : workspace.profile.curriculum === 'IGCSE'
            ? !hasDuplicateSubjects
            : false

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,196,180,.10),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(13,58,92,.10),_transparent_25%),linear-gradient(180deg,#f9fafb_0%,#ffffff_100%)] px-4 py-6 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-900/10 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A2540] shadow-[0_10px_24px_-10px_rgba(10,37,64,.35)]">
              <Sparkles className="h-6 w-6 text-[#CBFBF1]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#00C4B4]">Signup flow</p>
              <h1 className="font-display mt-1 text-3xl tracking-tight">Build the student profile once.</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => resetDraft('blank')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === 'blank'
                  ? 'bg-[#0A2540] text-white'
                  : 'border border-slate-900/10 bg-white text-slate-700 hover:border-[#00C4B4]/40 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white'
              }`}
            >
              Blank intake
            </button>
            <button
              type="button"
              onClick={() => resetDraft('demo')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === 'demo'
                  ? 'bg-[#00C4B4] text-white'
                  : 'border border-slate-900/10 bg-white text-slate-700 hover:border-[#00C4B4]/40 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white'
              }`}
            >
              Demo student
            </button>
            <Link
              href="/home"
              className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#00C4B4]/40 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
            >
              Back home
            </Link>
          </div>
        </header>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Step {step} of 4</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {step === 1
                    ? 'Selection area 1'
                    : step === 2
                      ? 'Selection area 2'
                      : step === 3
                        ? 'Selection area 3'
                        : 'Selection area 4'}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {step === 1
                    ? 'Tell us the basics first so the rest of the flow can shape itself around the student.'
                    : step === 2
                      ? 'Pick the curriculum subjects and confidence levels. The demo enforces the right minimums.'
                      : step === 3
                        ? 'Add one-off blocked dates and recurring free blocks. You can skip this if you are in a hurry.'
                        : 'Tell us what matters most, then agree to the placeholder privacy policy before finishing.'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-900/10 bg-[#F0FDFA] px-4 py-3 text-right dark:border-white/10 dark:bg-slate-950/40">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Mode</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{mode === 'demo' ? 'Demo student' : 'Blank intake'}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-4">
              {['Basics', 'Subjects', 'Schedule', 'Goals'].map((label, index) => {
                const active = step === index + 1
                const done = step > index + 1
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setStep(index + 1)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-[#0A2540] bg-[linear-gradient(135deg,#0A2540_0%,#0D3A5C_65%,#0E5060_100%)] text-white'
                        : done
                          ? 'border-[#CBFBF1] bg-[#F0FDFA] text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-white'
                          : 'border-slate-900/10 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.18em] opacity-70">0{index + 1}</p>
                    <p className="mt-1 text-sm font-semibold">{label}</p>
                  </button>
                )
              })}
            </div>

            {step === 1 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Country of residence</span>
                  <input
                    value={workspace.profile.country}
                    onChange={(event) =>
                      setWorkspace((current) => ({
                        ...current,
                        profile: { ...current.profile, country: event.target.value },
                      }))
                    }
                    placeholder="e.g. Japan"
                    className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Nationality</span>
                  <input
                    value={workspace.profile.nationality}
                    onChange={(event) =>
                      setWorkspace((current) => ({
                        ...current,
                        profile: { ...current.profile, nationality: event.target.value },
                      }))
                    }
                    placeholder="Optional"
                    className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                  />
                  <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">{NATIONALITIES_NOTE}</p>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Age</span>
                  <input
                    type="number"
                    min="10"
                    max="22"
                    value={workspace.profile.age}
                    onChange={(event) =>
                      setWorkspace((current) => ({
                        ...current,
                        profile: { ...current.profile, age: event.target.value },
                      }))
                    }
                    placeholder="e.g. 16"
                    className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Grade</span>
                  <select
                    value={workspace.profile.grade}
                    onChange={(event) =>
                      setWorkspace((current) => ({
                        ...current,
                        profile: { ...current.profile, grade: event.target.value },
                      }))
                    }
                    className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                  >
                    <option value="">Select grade</option>
                    {GRADE_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">School curriculum</span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {CURRICULUM_OPTIONS.map((curriculum) => {
                      const active = workspace.profile.curriculum === curriculum
                      return (
                        <button
                          key={curriculum}
                          type="button"
                          onClick={() => setCurriculum(curriculum)}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                            active
                              ? 'border-[#0A2540] bg-[linear-gradient(135deg,#0A2540_0%,#0D3A5C_65%,#0E5060_100%)] text-white'
                              : 'border-slate-900/10 bg-white text-slate-700 hover:border-[#00C4B4]/40 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:text-white'
                          }`}
                        >
                          <p className="text-lg font-semibold">{curriculum}</p>
                          <p className={`mt-1 text-sm leading-6 ${active ? 'text-white/75' : 'text-slate-500 dark:text-slate-400'}`}>
                            {curriculum === 'IB'
                              ? 'Six subjects, three HL minimum.'
                              : curriculum === 'A-levels'
                                ? 'At least three subjects.'
                                : 'Flexible subject count for IGCSE.'}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </label>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="mt-6 space-y-5">
                <div className="rounded-[1.5rem] border border-slate-900/10 bg-[#F0FDFA] p-4 dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">
                        {workspace.profile.curriculum || 'Choose a curriculum first'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{subjectRequirement.label}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                        {subjectProgress} selected
                      </span>
                      {isIb ? (
                        <span className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                          {hlProgress}/3 HL
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {!workspace.profile.curriculum ? (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-900/15 bg-white p-6 text-sm text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                    Select a curriculum to unlock the subject selection box.
                  </div>
                ) : null}

                {workspace.subjects.map((subject, index) => (
                  <div key={subject.id} className="rounded-[1.5rem] border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-slate-950/40">
                    <div className="grid gap-3 md:grid-cols-[1.3fr_.7fr_.7fr_auto]">
                      <label className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Subject {index + 1}
                        </span>
                        <select
                          value={subject.subject}
                          onChange={(event) => updateSubject(index, { subject: event.target.value })}
                          className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                        >
                          <option value="">Choose subject</option>
                          {getCurriculumSubjectBank(workspace.profile.curriculum).map((choice) => {
                            const selectedElsewhere = workspace.subjects.some(
                              (otherSubject, otherIndex) => otherIndex !== index && otherSubject.subject === choice,
                            )
                            return (
                              <option key={choice} value={choice} disabled={selectedElsewhere && choice !== subject.subject}>
                                {choice}
                              </option>
                            )
                          })}
                        </select>
                      </label>

                      {isIb ? (
                        <label className="grid gap-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Level</span>
                          <div className="flex gap-2">
                            {['HL', 'SL'].map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => updateSubject(index, { level: level as 'HL' | 'SL' })}
                                className={`flex-1 rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                                  subject.level === level
                                    ? 'border-[#0A2540] bg-[linear-gradient(135deg,#0A2540_0%,#0D3A5C_65%,#0E5060_100%)] text-white'
                                    : 'border-slate-900/10 bg-white text-slate-700 hover:border-[#00C4B4]/40 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200'
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </label>
                      ) : isALevels ? (
                        <div className="grid gap-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Level</span>
                          <div className="rounded-2xl border border-slate-900/10 bg-[#F0FDFA] px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                            A-level
                          </div>
                        </div>
                      ) : null}

                      <label className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Confidence</span>
                        <select
                          value={subject.confidence === null ? '' : String(subject.confidence)}
                          onChange={(event) =>
                            updateSubject(index, {
                              confidence: event.target.value ? Number(event.target.value) : null,
                            })
                          }
                          className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                        >
                          <option value="">-/10</option>
                          {Array.from({ length: 10 }, (_, value) => value + 1).map((rating) => (
                            <option key={rating} value={rating}>
                              {rating}/10
                            </option>
                          ))}
                        </select>
                      </label>

                      {isIgcse ? (
                        <button
                          type="button"
                          onClick={() => removeIgcseSubject(index)}
                          className="self-end rounded-full border border-slate-900/10 bg-white px-3 py-3 text-slate-500 transition hover:text-rose-600 dark:border-white/10 dark:bg-slate-950/40 dark:hover:text-rose-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}

                {isIgcse ? (
                  <button
                    type="button"
                    onClick={addIgcseSubject}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#00C4B4] transition hover:text-[#008f84]"
                  >
                    <Users className="h-4 w-4" />
                    Add another subject
                  </button>
                ) : null}

                {isIgcse ? (
                  <div className="rounded-[1.5rem] border border-slate-900/10 bg-[#F0FDFA] p-4 dark:border-white/10 dark:bg-slate-950/40">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Future curriculum</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">If you are taking IGCSE now, tell us what comes next.</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {FUTURE_PATH_OPTIONS.map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                        >
                          <input
                            type="radio"
                            name="future-path"
                            checked={workspace.profile.futurePath === option}
                            onChange={() =>
                              setWorkspace((current) => ({
                                ...current,
                                profile: { ...current.profile, futurePath: option },
                              }))
                            }
                            className="h-4 w-4 accent-[#00C4B4]"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                {workspace.profile.curriculum === 'IB' ? (
                  <div className="rounded-[1.5rem] border border-[#CBFBF1] bg-[#F0FDFA] p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                    <p className="font-semibold text-slate-950 dark:text-white">IB Extended Essay subject</p>
                    <select
                      value={workspace.profile.eeSubject}
                      onChange={(event) =>
                        setWorkspace((current) => ({
                          ...current,
                          profile: { ...current.profile, eeSubject: event.target.value },
                        }))
                      }
                      className="mt-3 w-full rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                    >
                      <option value="Undecided">Undecided</option>
                      {IB_SUBJECT_BANK.map((choice) => (
                        <option key={choice} value={choice}>
                          {choice}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-slate-900/10 bg-[#F0FDFA] p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200">
                    <p className="font-semibold text-slate-950 dark:text-white">Extended essay / future path</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">If this is not relevant yet, keep it blank or choose undecided later.</p>
                    <div className="mt-3 flex items-center gap-3">
                      <select
                        value={workspace.profile.eeSubject}
                        onChange={(event) =>
                          setWorkspace((current) => ({
                            ...current,
                            profile: { ...current.profile, eeSubject: event.target.value },
                          }))
                        }
                        className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                      >
                        <option value="Undecided">Undecided</option>
                        <option value="Not applicable">Not applicable</option>
                        {A_LEVEL_SUBJECT_BANK.slice(0, 6).map((choice) => (
                          <option key={choice} value={choice}>
                            {choice}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="mt-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-900/10 bg-[#F0FDFA] p-4 dark:border-white/10 dark:bg-slate-950/40">
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">When are you free?</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Mark blocked days, recurring blocks, and your weekly availability range.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#00C4B4]/40 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
                  >
                    Skip this for now
                  </button>
                </div>

                <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">One-off blocked days</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Tap dates on the calendar to mark special events or unavailable days.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                        className="rounded-full border border-slate-900/10 px-3 py-1.5 dark:border-white/10"
                      >
                        Prev
                      </button>
                      <span className="min-w-[140px] text-center font-semibold">{calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
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
                    {nextMonthGrid.map((date, index) => {
                      if (!date) return <div key={index} className="h-9" />
                      const iso = toIsoDate(date)
                      const blocked = workspace.schedule.blockedDates.includes(iso)
                      return (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => toggleBlockedDate(iso)}
                          className={`h-9 rounded-xl border text-xs font-semibold transition ${
                            blocked
                              ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200'
                              : 'border-slate-900/10 bg-white text-slate-700 hover:border-[#00C4B4]/40 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200'
                          }`}
                          title={blocked ? 'Blocked day' : 'Free day'}
                        >
                          {date.getDate()}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">Recurring free blocks</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Choose how often the block repeats and what the block is for.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addRecurringBlock}
                      className="rounded-full border border-slate-900/10 bg-[#F0FDFA] px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                      Add block
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {workspace.schedule.recurringBlocks.length ? (
                      workspace.schedule.recurringBlocks.map((block, index) => (
                        <div key={block.id} className="grid gap-3 rounded-2xl border border-slate-900/10 bg-[#F0FDFA] p-3 md:grid-cols-[.9fr_.6fr_.6fr_.7fr_auto] dark:border-white/10 dark:bg-white/5">
                          <select
                            value={block.day}
                            onChange={(event) => updateRecurringBlock(index, { day: event.target.value })}
                            className="rounded-2xl border border-slate-900/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                          >
                            {WEEK_DAYS.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                          <input
                            type="time"
                            value={block.start}
                            onChange={(event) => updateRecurringBlock(index, { start: event.target.value })}
                            className="rounded-2xl border border-slate-900/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                          />
                          <input
                            type="time"
                            value={block.end}
                            onChange={(event) => updateRecurringBlock(index, { end: event.target.value })}
                            className="rounded-2xl border border-slate-900/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                          />
                          <select
                            value={block.cadence}
                            onChange={(event) => updateRecurringBlock(index, { cadence: event.target.value as ScheduleBlock['cadence'] })}
                            className="rounded-2xl border border-slate-900/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                          >
                            {['One-off', 'Weekly', 'Biweekly', 'Monthly'].map((cadence) => (
                              <option key={cadence} value={cadence}>
                                {cadence}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeRecurringBlock(index)}
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-900/10 bg-white px-3 py-2.5 text-slate-500 hover:text-rose-600 dark:border-white/10 dark:bg-slate-950/40 dark:hover:text-rose-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <input
                            value={block.label}
                            onChange={(event) => updateRecurringBlock(index, { label: event.target.value })}
                            placeholder="What is this block for?"
                            className="rounded-2xl border border-slate-900/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#00C4B4] md:col-span-5 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-900/15 bg-white p-4 text-sm text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                        No recurring blocks yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-slate-950/40">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Approximately how many hours per week can you dedicate to pursuing external opportunities?
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Pick a start range and an end range using the two checkbox groups.
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Start</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {HOURS_RANGE_OPTIONS.map((option) => (
                          <label key={`start-${option}`} className="flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-[#F0FDFA] px-4 py-3 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                            <input
                              type="checkbox"
                              checked={workspace.schedule.weeklyHoursStart === option}
                              onChange={() =>
                                setWorkspace((current) => ({
                                  ...current,
                                  schedule: {
                                    ...current.schedule,
                                    weeklyHoursStart: current.schedule.weeklyHoursStart === option ? '' : option,
                                  },
                                }))
                              }
                              className="h-4 w-4 accent-[#00C4B4]"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">End</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {HOURS_RANGE_OPTIONS.map((option) => (
                          <label key={`end-${option}`} className="flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-[#F0FDFA] px-4 py-3 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                            <input
                              type="checkbox"
                              checked={workspace.schedule.weeklyHoursEnd === option}
                              onChange={() =>
                                setWorkspace((current) => ({
                                  ...current,
                                  schedule: {
                                    ...current.schedule,
                                    weeklyHoursEnd: current.schedule.weeklyHoursEnd === option ? '' : option,
                                  },
                                }))
                              }
                              className="h-4 w-4 accent-[#00C4B4]"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
                <div className="space-y-5">
                  <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">Tell us more about yourself</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Describe your goals, priorities, and current interests.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setWorkspace((current) => ({
                            ...current,
                            profile: { ...current.profile, goalsNarrative: '' },
                          }))
                        }
                        className="rounded-full border border-slate-900/10 bg-[#F0FDFA] px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                      >
                        Skip this for now
                      </button>
                    </div>

                    <textarea
                      value={workspace.profile.goalsNarrative}
                      onChange={(event) =>
                        setWorkspace((current) => ({
                          ...current,
                          profile: { ...current.profile, goalsNarrative: event.target.value },
                        }))
                      }
                      rows={10}
                      placeholder="What are you trying to achieve, what matters most, and what kind of opportunities feel worth pursuing?"
                      className="mt-4 w-full rounded-2xl border border-slate-900/10 bg-[#F0FDFA] px-4 py-3 text-sm outline-none transition focus:border-[#00C4B4] dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                    />
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-900/10 bg-[#0A2540] p-4 text-white dark:border-white/10">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#CBFBF1]">Preview</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        ['Country', workspace.profile.country || 'Not set'],
                        ['Curriculum', workspace.profile.curriculum || 'Not set'],
                        ['Subjects', workspace.subjects.filter((slot) => slot.subject.trim()).length ? `${workspace.subjects.filter((slot) => slot.subject.trim()).length} selected` : 'Not set'],
                        ['Weekly hours', workspace.schedule.weeklyHoursStart && workspace.schedule.weeklyHoursEnd ? `${workspace.schedule.weeklyHoursStart} to ${workspace.schedule.weeklyHoursEnd}` : 'Not set'],
                      ].map(([label, value]) => (
                        <div key={label as string} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
                          <p className="mt-2 text-sm font-semibold">{value as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[1.5rem] border border-slate-900/10 bg-[#F0FDFA] p-4 dark:border-white/10 dark:bg-slate-950/40">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#00C4B4]" />
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">Privacy policy</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Placeholder checkbox for the demo.</p>
                      </div>
                    </div>
                    <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={workspace.profile.privacyAccepted}
                        onChange={(event) =>
                          setWorkspace((current) => ({
                            ...current,
                            profile: { ...current.profile, privacyAccepted: event.target.checked },
                          }))
                        }
                        className="mt-0.5 h-4 w-4 accent-[#00C4B4]"
                      />
                      <span>
                        I agree to the placeholder privacy policy and understand this demo stores my profile locally on this device.
                        <Link href="/privacy" className="ml-1 font-semibold text-[#00C4B4] underline-offset-4 hover:underline">
                          Read policy
                        </Link>
                      </span>
                    </label>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-slate-950/40">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Final review</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      This is the last check before we hand off to the student dashboard.
                    </p>
                    <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <p>- Step 1: basic profile</p>
                      <p>- Step 2: subject selection</p>
                      <p>- Step 3: schedule preferences</p>
                      <p>- Step 4: goals and privacy consent</p>
                    </div>
                    <button
                      type="button"
                      onClick={completeSignup}
                      disabled={loading || !workspace.profile.privacyAccepted || !canContinueStepTwo || !canContinueStepOne}
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#00C4B4] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(0,196,180,.45)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Create my profile
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-900/10 pt-5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(1, current - 1))}
                disabled={step === 1}
                className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/privacy"
                  className="text-sm font-semibold text-slate-500 underline-offset-4 hover:text-slate-950 hover:underline dark:text-slate-400 dark:hover:text-white"
                >
                  Privacy policy
                </Link>
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => Math.min(4, current + 1))}
                    disabled={
                      (step === 1 && !canContinueStepOne) ||
                      (step === 2 && !canContinueStepTwo) ||
                      (step === 3 && workspace.profile.curriculum === '' )
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-[#0A2540] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-[#CBFBF1] bg-[#F0FDFA] p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00C4B4]">Why this stepper works</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">It keeps the intake structured without feeling long.</h3>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                <p>- The demo uses the same state model for blank and preloaded profiles.</p>
                <p>- Curriculum-specific subject rules are enforced in the UI, not hidden in the backend.</p>
                <p>- The saved profile is available immediately on the student dashboard.</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#CBFBF1]">Demo mode</p>
                  <h3 className="mt-2 text-xl font-semibold">Preloaded profile sample</h3>
                </div>
                <Users className="h-5 w-5 text-[#CBFBF1]" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Profile signal</p>
                  <p className="mt-2 text-sm leading-7 text-white/80">
                    {mode === 'demo'
                      ? 'Japan-based IB student with a visible academic and extracurricular structure.'
                      : 'Blank mode stays empty until the student fills it in.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Current step</p>
                  <p className="mt-2 text-sm leading-7 text-white/80">
                    {step === 1
                      ? 'Basics first'
                      : step === 2
                        ? 'Subject selection'
                        : step === 3
                          ? 'Schedule and availability'
                          : 'Goals and consent'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Saved draft</p>
                  <p className="mt-2 text-sm leading-7 text-white/80">
                    This wizard writes to localStorage so the next page opens with the same sample state.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
