
const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:3000/api'

// Same keys as the dashboard sign-in, so one login works everywhere.
const TOKEN_KEY = 'intervio_token'
const USER_KEY = 'intervio_user'
export const UNAUTHORIZED_EVENT = 'intervio:unauthorized'

export function hasSession(): boolean {
  try {
    return !!localStorage.getItem(TOKEN_KEY)
  } catch {
    return false
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  let token: string | null = null
  try {
    token = localStorage.getItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    const init: RequestInit = { method: options.method ?? 'GET', headers }
    if (options.body !== undefined) init.body = JSON.stringify(options.body)
    res = await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and that the backend is running.', 0)
  }

  const json = (await res.json().catch(() => null)) as { message?: string; data?: T } | null

  if (!res.ok) {
    if (res.status === 401 && token) {
      try {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    throw new ApiError(json?.message ?? `Request failed (${res.status})`, res.status)
  }
  return json?.data as T
}

// types

export type InterviewStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type Question = {
  id: string
  interviewId: string
  questionText: string
  questionType: string | null
  order: number
}

export type Evaluation = {
  id: string
  interviewId: string
  overallScore: number | null
  technicalScore: number | null
  communicationScore: number | null
  confidenceScore: number | null
  feedback: string | null
  strengths: string | null
  weaknesses: string | null
  createdAt: string
}

export type InterviewDetail = {
  id: string
  title: string
  role: string
  difficulty: string | null
  language: string | null
  status: InterviewStatus
  createdAt: string
  questions: Question[]
  evaluation: Evaluation | null
}

export type Answer = {
  id: string
  questionId: string
  answerText: string | null
  audioUrl: string | null
}

// requests

export const getInterview = (id: string) => request<InterviewDetail>(`/interviews/${id}`)

export async function createInterview(input: {
  title: string
  role: string
  difficulty?: string | null
  language?: string | null
}): Promise<string> {
  const body: Record<string, string> = { title: input.title, role: input.role }
  if (input.difficulty) body.difficulty = input.difficulty
  if (input.language) body.language = input.language
  const res = await request<{ interview: { id: string } }>('/interviews', { method: 'POST', body })
  return res.interview.id
}

export const cancelInterview = (id: string) =>
  request<unknown>(`/interviews/${id}/status`, { method: 'PATCH', body: { status: 'CANCELLED' } })

/** Returns null when the question has no answer yet (server answers 404). */
export async function getAnswer(questionId: string): Promise<Answer | null> {
  try {
    return await request<Answer>(`/answers/question/${questionId}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

/**
 * The server only allows ONE answer per question (409 on a second POST), so if
 * the answer already exists we return the saved text instead of failing.
 */
export async function saveAnswer(questionId: string, answerText: string): Promise<string> {
  try {
    const a = await request<Answer>('/answers', { method: 'POST', body: { questionId, answerText } })
    return a.answerText ?? answerText
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      const existing = await getAnswer(questionId)
      if (existing?.answerText) return existing.answerText
    }
    throw e
  }
}

export async function getEvaluation(interviewId: string): Promise<Evaluation | null> {
  try {
    return await request<Evaluation>(`/evaluations/interview/${interviewId}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

/** Asks Gemini to score the interview. Every question must be answered first. */
export async function evaluateInterview(interviewId: string): Promise<Evaluation> {
  try {
    return await request<Evaluation>('/evaluations', { method: 'POST', body: { interviewId } })
  } catch (e) {
    // Evaluation already exists (e.g. double click or a retry): just load it.
    if (e instanceof ApiError && e.status === 409) {
      const existing = await getEvaluation(interviewId)
      if (existing) return existing
    }
    throw e
  }
}

//helpers

/** Language names used when creating interviews, mapped to speech locales. */
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

export const localeFor = (language: string | null | undefined) =>
  (language && LANGUAGE_LOCALES[language]) || 'en-IN'

/** strengths / weaknesses are stored as a JSON array string by the evaluator */
export function parseList(text: string | null): string[] {
  if (!text) return []
  try {
    const parsed: unknown = JSON.parse(text)
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === 'string' && x.trim() !== '')
    }
  } catch {
    /* plain text */
  }
  return text
    .split(/\n|•|;/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export const SKIP_TEXT = 'I would like to skip this question.'

const DRAFT_PREFIX = 'intervio_draft_'
export const loadDraft = (questionId: string | undefined): string => {
  if (!questionId) return ''
  try {
    return sessionStorage.getItem(DRAFT_PREFIX + questionId) ?? ''
  } catch {
    return ''
  }
}
export const saveDraft = (questionId: string, text: string) => {
  try {
    if (text) sessionStorage.setItem(DRAFT_PREFIX + questionId, text)
    else sessionStorage.removeItem(DRAFT_PREFIX + questionId)
  } catch {
    /* ignore */
  }
}
