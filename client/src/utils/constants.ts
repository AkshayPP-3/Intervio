export const APP_NAME = 'Intervio'

export const LANGUAGE_LOCALES: Record<string, string> = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  Kannada: 'kn-IN',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Marathi: 'mr-IN',
  Bengali: 'bn-IN',
  Malayalam: 'ml-IN',
  Gujarati: 'gu-IN',
  Punjabi: 'pa-IN',
}
export const LANGUAGES = Object.keys(LANGUAGE_LOCALES)
export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']

export const TECH_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Software Engineer',
  'Data Scientist',
  'DevOps Engineer',
  'Mobile Developer',
  'QA Engineer',
]

export const STATUS_LABEL = {
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In progress',
  CANCELLED: 'Cancelled',
} as const

export const STATUS_STYLE = {
  COMPLETED: 'bg-emerald-500/15 text-emerald-300',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-300',
  CANCELLED: 'bg-slate-600/40 text-slate-300',
} as const

/** Same key the Practice page uses, so Settings and Practice share defaults. */
export const PREFS_KEY = 'intervio_practice_prefs'

export const MAX_RESUME_BYTES = 5 * 1024 * 1024
export const RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx']
