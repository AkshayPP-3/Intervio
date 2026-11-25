
import { ApiError, api, getOrNull } from '../../services/api'
import { LANGUAGE_LOCALES } from '../../utils/constants'
import type { Answer, Evaluation, Interview, InterviewDetail } from '../../types/interview.types'

export type { Answer, Evaluation, Interview, InterviewDetail, InterviewStatus, Question } from '../../types/interview.types'

export const listInterviews = () => api.get<Interview[]>('/interviews')

export const getInterview = (id: string) => api.get<InterviewDetail>(`/interviews/${id}`)

export async function createInterview(input: {
  title: string
  role: string
  difficulty?: string | null
  language?: string | null
}): Promise<string> {
  const body: Record<string, string> = { title: input.title, role: input.role }
  if (input.difficulty) body.difficulty = input.difficulty
  if (input.language) body.language = input.language
  // The server asks Gemini for the questions, so this call can take a few seconds.
  const res = await api.post<{ interview: { id: string } }>('/interviews', body)
  return res.interview.id
}

export const cancelInterview = (id: string) => api.patch<unknown>(`/interviews/${id}/status`, { status: 'CANCELLED' })

export const deleteInterview = (id: string) => api.del(`/interviews/${id}`)

/** Returns null when the question has no answer yet (server answers 404). */
export const getAnswer = (questionId: string) => getOrNull<Answer>(`/answers/question/${questionId}`)

/**
 * The server only allows ONE answer per question (409 on a second POST), so if
 * the answer already exists we return the saved text instead of failing.
 */
export async function saveAnswer(questionId: string, answerText: string): Promise<string> {
  try {
    const a = await api.post<Answer>('/answers', { questionId, answerText })
    return a.answerText ?? answerText
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      const existing = await getAnswer(questionId)
      if (existing?.answerText) return existing.answerText
    }
    throw e
  }
}

export const getEvaluation = (interviewId: string) => getOrNull<Evaluation>(`/evaluations/interview/${interviewId}`)

/** Asks Gemini to score the interview. Every question must be answered first. */
export async function evaluateInterview(interviewId: string): Promise<Evaluation> {
  try {
    return await api.post<Evaluation>('/evaluations', { interviewId })
  } catch (e) {
    // Already evaluated (double click or a retry): just load it.
    if (e instanceof ApiError && e.status === 409) {
      const existing = await getEvaluation(interviewId)
      if (existing) return existing
    }
    throw e
  }
}

/* -------------------------------- helpers --------------------------------- */

export { LANGUAGE_LOCALES }
export { parseList } from '../../utils/helpers'

export const localeFor = (language: string | null | undefined) =>
  (language && LANGUAGE_LOCALES[language]) || 'en-IN'

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
