import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

export const CURRICULA = ['IB', 'AP', 'SAT', 'ACT', 'A-Level', 'Other']
export const GRADE_LEVELS = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Exam-level']
export const QUESTION_TYPES = [
  'Multiple Choice',
  'Short Answer',
  'Long Answer',
  'True/False',
  'Fill in the Blank',
]

export const IB_SUBJECTS = [
  'Mathematics AA HL', 'Mathematics AA SL', 'Mathematics AI HL', 'Mathematics AI SL',
  'Physics HL', 'Physics SL', 'Chemistry HL', 'Chemistry SL', 'Biology HL', 'Biology SL',
  'English A HL', 'English A SL', 'History HL', 'History SL',
  'Economics HL', 'Economics SL', 'Psychology HL', 'Psychology SL',
  'Computer Science HL', 'Computer Science SL',
]

export const AP_SUBJECTS = [
  'AP Calculus BC', 'AP Calculus AB', 'AP Statistics',
  'AP Physics C', 'AP Physics 1', 'AP Physics 2',
  'AP Chemistry', 'AP Biology', 'AP Environmental Science',
  'AP English Literature', 'AP English Language',
  'AP US History', 'AP World History', 'AP European History',
  'AP Economics (Micro)', 'AP Economics (Macro)',
  'AP Psychology', 'AP Computer Science A',
]
