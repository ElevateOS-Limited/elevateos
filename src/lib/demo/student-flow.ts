export type DemoMode = 'blank' | 'demo'
export type CurriculumChoice = 'IGCSE' | 'IB' | 'A-levels' | ''

export type SubjectSlot = {
  id: string
  subject: string
  level: '' | 'HL' | 'SL' | 'A-level'
  confidence: number | null
}

export type ScheduleBlock = {
  id: string
  day: string
  start: string
  end: string
  cadence: 'One-off' | 'Weekly' | 'Biweekly' | 'Monthly'
  label: string
}

export type TutorMatch = {
  id: string
  name: string
  university: string
  education: string
  teachingExperience: string
  grades: string
  style: string
  price: string
  availability: string[]
}

export type ReadingItem = {
  id: string
  title: string
  subject: string
  source: string
}

export type SessionItem = {
  id: string
  date: string
  time: string
  subject: string
  title: string
  notes: string
}

export type GoalSuggestion = {
  id: string
  title: string
  reason: string
  accepted: boolean
  hidden: boolean
}

export type ActivityItem = {
  id: string
  title: string
  category: string
  summary: string
  impact: string
  commitment: string
  notes: string
  accepted: boolean
  rejected: boolean
  rejectReason: string
  details: string
}

export type AnalysisState = {
  status: 'idle' | 'running' | 'ready'
  log: string[]
  findings: string[]
  verdict: string
  note: string
}

export type TutorSearchState = {
  subject: string
  preferences: string
  timeSlot: string
  priceFilter: string
  status: 'idle' | 'searching' | 'results'
  log: string[]
}

export type ProfileDraft = {
  country: string
  nationality: string
  age: string
  grade: string
  curriculum: CurriculumChoice
  futurePath: string
  eeSubject: string
  goalsNarrative: string
  privacyAccepted: boolean
}

export type DemoWorkspaceState = {
  mode: DemoMode
  profile: ProfileDraft
  subjects: SubjectSlot[]
  schedule: {
    blockedDates: string[]
    recurringBlocks: ScheduleBlock[]
    weeklyHoursStart: string
    weeklyHoursEnd: string
  }
  tutoring: {
    preferenceSummary: string
    homework: string[]
    submittedAssignments: string[]
    upcomingSessions: SessionItem[]
    reading: ReadingItem[]
    tutorMatches: TutorMatch[]
    tutorSearch: TutorSearchState
    selectedTutorId: string
    messageDraft: string
  }
  activities: {
    goals: string[]
    recommendedGoals: GoalSuggestion[]
    targetUniversities: string[]
    currentActivities: ActivityItem[]
    activityRecommendations: ActivityItem[]
    finderState: 'idle' | 'searching' | 'results'
    finderLog: string[]
    analysis: AnalysisState
  }
}

export const CURRICULUM_OPTIONS: CurriculumChoice[] = ['IGCSE', 'IB', 'A-levels']

export const GRADE_OPTIONS = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'IB1', 'IB2', 'Year 12', 'Year 13']

export const NATIONALITIES_NOTE =
  'Optional. This helps us filter opportunities that are limited to certain nationalities.'

export const IB_SUBJECT_BANK = [
  'Mathematics AA',
  'Mathematics AI',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'History',
  'English A',
  'English B',
  'Computer Science',
  'Business Management',
  'Psychology',
  'Geography',
  'Art',
]

export const A_LEVEL_SUBJECT_BANK = [
  'Mathematics',
  'Further Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'History',
  'English Literature',
  'Computer Science',
  'Business',
  'Psychology',
  'Geography',
]

export const IGCSE_SUBJECT_BANK = [
  'English Language',
  'English Literature',
  'Mathematics',
  'Additional Mathematics',
  'Biology',
  'Chemistry',
  'Physics',
  'Combined Science',
  'Economics',
  'Business Studies',
  'Computer Science',
  'History',
  'Geography',
  'French',
  'Spanish',
  'Mandarin',
  'Art & Design',
]

export const FUTURE_PATH_OPTIONS = ['A-levels', 'IB', 'Something else']

export const HOURS_RANGE_OPTIONS = ['0-5', '5-10', '10-15', '15-20', '20+']

export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function makeEmptySubjects(count: number): SubjectSlot[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `slot-${index + 1}`,
    subject: '',
    level: '',
    confidence: null,
  }))
}

const BLANK_PROFILE: DemoWorkspaceState = {
  mode: 'blank',
  profile: {
    country: '',
    nationality: '',
    age: '',
    grade: '',
    curriculum: '',
    futurePath: '',
    eeSubject: 'Undecided',
    goalsNarrative: '',
    privacyAccepted: false,
  },
  subjects: [],
  schedule: {
    blockedDates: [],
    recurringBlocks: [],
    weeklyHoursStart: '',
    weeklyHoursEnd: '',
  },
  tutoring: {
    preferenceSummary: '',
    homework: ['No pending assignments!'],
    submittedAssignments: [],
    upcomingSessions: [],
    reading: [],
    tutorMatches: [],
    tutorSearch: {
      subject: '',
      preferences: '',
      timeSlot: '',
      priceFilter: 'Any',
      status: 'idle',
      log: [],
    },
    selectedTutorId: '',
    messageDraft: '',
  },
  activities: {
    goals: [],
    recommendedGoals: [],
    targetUniversities: [],
    currentActivities: [],
    activityRecommendations: [],
    finderState: 'idle',
    finderLog: [],
    analysis: {
      status: 'idle',
      log: [],
      findings: [],
      verdict: '',
      note: '',
    },
  },
}

const DEMO_PROFILE: DemoWorkspaceState = {
  mode: 'demo',
  profile: {
    country: 'Japan',
    nationality: 'Japanese',
    age: '16',
    grade: 'IB1',
    curriculum: 'IB',
    futurePath: 'IB',
    eeSubject: 'Economics',
    goalsNarrative:
      'I want to combine strong academics with a visible leadership story, keep my timetable realistic, and build a profile that stands out without looking forced.',
    privacyAccepted: true,
  },
  subjects: [
    { id: 'ib-1', subject: 'Mathematics AA', level: 'HL', confidence: 8 },
    { id: 'ib-2', subject: 'Physics', level: 'HL', confidence: 7 },
    { id: 'ib-3', subject: 'Economics', level: 'HL', confidence: 9 },
    { id: 'ib-4', subject: 'English A', level: 'SL', confidence: 8 },
    { id: 'ib-5', subject: 'History', level: 'SL', confidence: 7 },
    { id: 'ib-6', subject: 'Computer Science', level: 'SL', confidence: 8 },
  ],
  schedule: {
    blockedDates: ['2026-05-08', '2026-05-15'],
    recurringBlocks: [
      { id: 'block-1', day: 'Tuesday', start: '18:00', end: '20:00', cadence: 'Weekly', label: 'Robotics' },
      { id: 'block-2', day: 'Thursday', start: '17:00', end: '19:00', cadence: 'Weekly', label: 'Tutoring' },
      { id: 'block-3', day: 'Saturday', start: '10:00', end: '12:00', cadence: 'Biweekly', label: 'Admissions work' },
    ],
    weeklyHoursStart: '10-15',
    weeklyHoursEnd: '15-20',
  },
  tutoring: {
    preferenceSummary:
      'I like tutors who move quickly, explain why a method works, and give me one concrete thing to fix after every session.',
    homework: [
      'Finish the integration practice set',
      'Rewrite the chemistry explanation in exam language',
      'Prepare two questions for the next session',
    ],
    submittedAssignments: ['2026-05-02: Calculus warm-up', '2026-05-04: Physics short response'],
    upcomingSessions: [
      {
        id: 'sess-1',
        date: '2026-05-09',
        time: '18:30',
        subject: 'Mathematics AA HL',
        title: 'Integration review',
        notes: 'Bring the worksheet with boundary mistakes highlighted.',
      },
      {
        id: 'sess-2',
        date: '2026-05-12',
        time: '17:00',
        subject: 'Economics HL',
        title: 'Evaluation and essay structure',
        notes: 'Focus on chains of reasoning and evidence selection.',
      },
    ],
    reading: [
      { id: 'read-1', title: 'How to write sharper IB math working', subject: 'Mathematics AA HL', source: 'Examiner notes' },
      { id: 'read-2', title: 'Turning economics examples into stronger evaluation', subject: 'Economics HL', source: 'Tutor note' },
      { id: 'read-3', title: 'Common HL question traps and how to avoid them', subject: 'Study guide', source: 'ElevateOS' },
    ],
    tutorMatches: [
      {
        id: 'tutor-1',
        name: 'Alicia Tan',
        university: 'University of Cambridge',
        education: 'MEng Mathematics',
        teachingExperience: '4 years of IB tutoring and mock exam review',
        grades: '44/45 IB, 9 in Maths HL',
        style: 'Fast, structured, and proof-first',
        price: '$55/hr',
        availability: ['Mon 17:00', 'Tue 19:00', 'Thu 18:30'],
      },
      {
        id: 'tutor-2',
        name: 'Marcus Lee',
        university: 'London School of Economics',
        education: 'BSc Economics',
        teachingExperience: 'Admissions and economics specialist',
        grades: '43/45 IB, 9 in Economics HL',
        style: 'Essay feedback, examples, and concise accountability',
        price: '$50/hr',
        availability: ['Wed 16:00', 'Thu 19:00', 'Sat 11:00'],
      },
      {
        id: 'tutor-3',
        name: 'Priya Shah',
        university: 'Imperial College London',
        education: 'MSci Physics',
        teachingExperience: 'Built exam drills for HL sciences',
        grades: '42/45 IB, 9 in Physics HL',
        style: 'Visual explanations and short correction loops',
        price: '$58/hr',
        availability: ['Tue 18:00', 'Fri 17:30', 'Sun 10:00'],
      },
    ],
    tutorSearch: {
      subject: 'Mathematics AA HL',
      preferences: 'Structured, exam-focused, and happy to give me a short homework list.',
      timeSlot: 'Thursday after 5pm',
      priceFilter: 'Under $60/hr',
      status: 'results',
      log: ['Scanning tutor pool...', 'Comparing overlap with your free blocks...', 'Sorting by fit and price...'],
    },
    selectedTutorId: 'tutor-1',
    messageDraft: 'Could we focus on integration setup and exam timing in the next lesson?',
  },
  activities: {
    goals: [
      'Build one leadership story that is obviously mine',
      'Keep academics strong without making the week unrealistic',
      'Turn extracurriculars into something selective and coherent',
    ],
    recommendedGoals: [
      {
        id: 'goal-1',
        title: 'Lead one sustained project',
        reason: 'This strengthens impact without adding random activity noise.',
        accepted: true,
        hidden: false,
      },
      {
        id: 'goal-2',
        title: 'Build a public artifact',
        reason: 'A published output makes your work easier to judge and remember.',
        accepted: false,
        hidden: false,
      },
      {
        id: 'goal-3',
        title: 'Protect one weekly reflection block',
        reason: 'Reflection makes the activity list coherent rather than crowded.',
        accepted: false,
        hidden: false,
      },
    ],
    targetUniversities: ['University of Tokyo', 'Waseda University', 'Keio University'],
    currentActivities: [
      {
        id: 'activity-1',
        title: 'Robotics build lead',
        category: 'STEM',
        summary: 'Coordinates weekly builds and demo scripts for the school robotics team.',
        impact: 'Clear technical ownership and visible team leadership.',
        commitment: '4 hrs/week',
        notes: 'Document the build decisions and post one reflection after each competition sprint.',
        accepted: true,
        rejected: false,
        rejectReason: '',
        details: 'Run the team planning board, test components, and help explain the design to younger students.',
      },
      {
        id: 'activity-2',
        title: 'Peer tutoring cohort',
        category: 'Academic',
        summary: 'Runs a weekly math review session for younger students.',
        impact: 'Shows service, communication, and subject mastery.',
        commitment: '2 hrs/week',
        notes: 'Track attendance and the topic each student struggled with.',
        accepted: true,
        rejected: false,
        rejectReason: '',
        details: 'Prepare a short recap sheet after each session and note any recurring weak points.',
      },
    ],
    activityRecommendations: [
      {
        id: 'activity-rec-1',
        title: 'Launch a one-month study podcast',
        category: 'Media',
        summary: 'A compact public project about exam strategy and student life.',
        impact: 'Makes your voice and thinking visible beyond the classroom.',
        commitment: '2 hrs/week',
        notes: 'Great if you can publish consistently and keep it concise.',
        accepted: false,
        rejected: false,
        rejectReason: '',
        details: 'Record short episodes, invite one guest, and summarize one lesson from each episode.',
      },
      {
        id: 'activity-rec-2',
        title: 'Coordinate a charity revision clinic',
        category: 'Service',
        summary: 'Run a subject support event for younger students or peers.',
        impact: 'Combines service with academic strength and leadership.',
        commitment: '3 hrs/week',
        notes: 'Useful if you want visible impact in the school community.',
        accepted: false,
        rejected: false,
        rejectReason: '',
        details: 'Plan the event, recruit volunteers, and collect one measurable outcome at the end.',
      },
      {
        id: 'activity-rec-3',
        title: 'Research mini-project on urban transport',
        category: 'Research',
        summary: 'A focused analysis with a clear deliverable and timeline.',
        impact: 'Creates an academic artifact with depth and specificity.',
        commitment: '4 hrs/week',
        notes: 'Strong if you can show data collection or a written output.',
        accepted: false,
        rejected: false,
        rejectReason: '',
        details: 'Collect small data samples, write a short report, and publish the final takeaways.',
      },
      {
        id: 'activity-rec-4',
        title: 'Local climate action sprint',
        category: 'Service',
        summary: 'A short campaign tied to a measurable community outcome.',
        impact: 'Shows initiative, planning, and a public-facing result.',
        commitment: '2-3 hrs/week',
        notes: 'Good if you can recruit two other people and track outputs.',
        accepted: false,
        rejected: false,
        rejectReason: '',
        details: 'Build a task board, set one target, and capture a before/after impact note.',
      },
      {
        id: 'activity-rec-5',
        title: 'Weekend coding clinic',
        category: 'Mentoring',
        summary: 'Teach beginner coding or spreadsheet skills to younger students.',
        impact: 'Reinforces leadership, clarity, and repetition over time.',
        commitment: '2 hrs/week',
        notes: 'Helpful if you want a practical recurring commitment.',
        accepted: false,
        rejected: false,
        rejectReason: '',
        details: 'Prepare one lesson, one worksheet, and one improvement note per session.',
      },
    ],
    finderState: 'results',
    finderLog: ['Pulling in profile context...', 'Matching activities to goals...', 'Checking time commitment fit...'],
    analysis: {
      status: 'ready',
      log: [
        'Checking non-negotiables...',
        'Reviewing activity uniqueness...',
        'Comparing the story against target universities...',
      ],
      findings: [
        'You meet the academic floor for the current shortlist.',
        'The robotics work is the strongest uniqueness signal.',
        'You should avoid adding any activity that sounds generic or purely decorative.',
      ],
      verdict: 'The current plan can work if you protect depth over breadth and keep one leadership story central.',
      note: 'Your profile is strongest when the weekly schedule stays realistic and the outputs are documented.',
    },
  },
}

export function createBlankWorkspaceState(mode: DemoMode = 'blank'): DemoWorkspaceState {
  return clone({
    ...BLANK_PROFILE,
    mode,
  })
}

export function createDemoWorkspaceState(mode: DemoMode = 'demo'): DemoWorkspaceState {
  return clone({
    ...DEMO_PROFILE,
    mode,
  })
}

export function createWorkspaceState(mode: DemoMode) {
  return mode === 'demo' ? createDemoWorkspaceState(mode) : createBlankWorkspaceState(mode)
}

export function createSubjectSlots(curriculum: CurriculumChoice, mode: DemoMode = 'blank'): SubjectSlot[] {
  if (curriculum === 'IB') {
    return mode === 'demo'
      ? [
          { id: 'ib-1', subject: 'Mathematics AA', level: 'HL', confidence: 8 },
          { id: 'ib-2', subject: 'Physics', level: 'HL', confidence: 7 },
          { id: 'ib-3', subject: 'Economics', level: 'HL', confidence: 9 },
          { id: 'ib-4', subject: 'English A', level: 'SL', confidence: 8 },
          { id: 'ib-5', subject: 'History', level: 'SL', confidence: 7 },
          { id: 'ib-6', subject: 'Computer Science', level: 'SL', confidence: 8 },
        ]
      : makeEmptySubjects(6)
  }

  if (curriculum === 'A-levels') {
    return mode === 'demo'
      ? [
          { id: 'alevel-1', subject: 'Mathematics', level: 'A-level', confidence: 8 },
          { id: 'alevel-2', subject: 'Physics', level: 'A-level', confidence: 7 },
          { id: 'alevel-3', subject: 'Economics', level: 'A-level', confidence: 9 },
        ]
      : makeEmptySubjects(3).map((slot) => ({ ...slot, level: 'A-level' as const }))
  }

  return mode === 'demo'
    ? [
        { id: 'igcse-1', subject: 'Mathematics', level: '', confidence: 8 },
        { id: 'igcse-2', subject: 'Physics', level: '', confidence: 7 },
        { id: 'igcse-3', subject: 'English Language', level: '', confidence: 8 },
        { id: 'igcse-4', subject: 'Economics', level: '', confidence: 6 },
      ]
    : makeEmptySubjects(4)
}

export function getWorkspaceStorageKey(mode: DemoMode) {
  return `elevateos.student.workspace.${mode}`
}

export function loadWorkspaceState(mode: DemoMode): DemoWorkspaceState | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(getWorkspaceStorageKey(mode))
  if (!raw) return null

  try {
    return JSON.parse(raw) as DemoWorkspaceState
  } catch {
    return null
  }
}

export function saveWorkspaceState(mode: DemoMode, state: DemoWorkspaceState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getWorkspaceStorageKey(mode), JSON.stringify(state))
}

export type TutorSearchCompletionInput = {
  mode: DemoMode
  current: DemoWorkspaceState
  lines: string[]
  subject: string
  preferences: string
  timeSlot: string
  priceFilter: string
}

export function resolveTutorSearchCompletion(input: TutorSearchCompletionInput) {
  const baseSearch = {
    subject: input.subject,
    preferences: input.preferences,
    timeSlot: input.timeSlot,
    priceFilter: input.priceFilter,
  }

  if (input.mode !== 'demo') {
    return {
      resultsReady: false,
      workspace: {
        ...input.current,
        tutoring: {
          ...input.current.tutoring,
          tutorSearch: {
            ...baseSearch,
            status: 'idle' as const,
            log: [],
          },
        },
      },
    }
  }

  return {
    resultsReady: true,
    workspace: {
      ...input.current,
      tutoring: {
        ...input.current.tutoring,
        tutorSearch: {
          ...baseSearch,
          status: 'results' as const,
          log: input.lines,
        },
        selectedTutorId: input.current.tutoring.tutorMatches[0]?.id || input.current.tutoring.selectedTutorId,
      },
    },
  }
}

export type ActivityFinderCompletionInput = {
  mode: DemoMode
  current: DemoWorkspaceState
  lines: string[]
  recommendations: ActivityItem[]
}

export function resolveActivityFinderCompletion(input: ActivityFinderCompletionInput) {
  if (input.mode !== 'demo') {
    return {
      workspace: {
        ...input.current,
        activities: {
          ...input.current.activities,
          finderState: 'idle' as const,
          finderLog: [],
          activityRecommendations: input.current.activities.activityRecommendations,
        },
      },
    }
  }

  return {
    workspace: {
      ...input.current,
      activities: {
        ...input.current.activities,
        finderState: 'results' as const,
        finderLog: input.lines,
        activityRecommendations: input.current.activities.activityRecommendations.length
          ? input.current.activities.activityRecommendations
          : input.recommendations,
      },
    },
  }
}

export function parseIsoDateLocal(iso: string) {
  const [yearText, monthText, dayText] = iso.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  return new Date(year, month - 1, day)
}

export function formatDemoDate(iso: string) {
  return parseIsoDateLocal(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function getMonthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: Array<Date | null> = []

  for (let index = 0; index < startDay; index += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(month.getFullYear(), month.getMonth(), day))
  while (cells.length % 7 !== 0) cells.push(null)

  return cells
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getCurriculumSubjectBank(curriculum: CurriculumChoice) {
  if (curriculum === 'IB') return IB_SUBJECT_BANK
  if (curriculum === 'A-levels') return A_LEVEL_SUBJECT_BANK
  return IGCSE_SUBJECT_BANK
}
