import { api } from '../../services/api'
import { mapLimit } from '../../utils/helpers'
import { getAnswer, getInterview } from '../interview/interview.service'
import type { Evaluation, Interview, InterviewDetail, Question } from '../../types/interview.types'

export type Report = { interview: Interview; evaluation: Evaluation }

/**
 * Every completed interview with its evaluation, newest first,
 * fetched in a single request.
 */
export const listReports = (max = 40): Promise<Report[]> =>
  api.get<Report[]>(`/evaluations?limit=${max}`)

export type ReportDetail = {
  interview: InterviewDetail
  questions: Question[]
  answers: Record<string, string>
}

/** Questions and the saved answers for one interview. */
export async function getReportDetail(interviewId: string): Promise<ReportDetail> {
  const interview = await getInterview(interviewId)
  const questions = [...interview.questions].sort((a, b) => a.order - b.order)
  const answers: Record<string, string> = {}

  const hasEmbeddedAnswers = questions.some((q) => q.answer !== undefined)
  if (hasEmbeddedAnswers) {
    questions.forEach((q) => {
      if (q.answer?.answerText != null) answers[q.id] = q.answer.answerText
    })
  } else {
    const saved = await mapLimit(questions, 5, (q) => getAnswer(q.id).catch(() => null))
    questions.forEach((q, i) => {
      const text = saved[i]?.answerText
      if (text != null) answers[q.id] = text
    })
  }
  return { interview, questions, answers }
}

export const TIPS: Record<string, string> = {
  Technical: 'Revise the core concepts for this role, then explain each one out loud as if teaching a friend.',
  Communication: 'Answer in a clear order: point first, then a short example, then the result.',
  Confidence: 'Slow down, pause before answering, and avoid filler words. Practise with timed mock answers.',
}

/** One sentence about the lowest skill, with advice. Null when there are no skill scores. */
export function weakestTip(e: Evaluation): string | null {
  const dims: Array<{ name: string; score: number | null }> = [
    { name: 'Technical', score: e.technicalScore },
    { name: 'Communication', score: e.communicationScore },
    { name: 'Confidence', score: e.confidenceScore },
  ]
  const scored = dims.filter((d): d is { name: string; score: number } => d.score != null)
  if (!scored.length) return null
  const low = scored.reduce((a, b) => (b.score < a.score ? b : a))
  return `Your lowest area was ${low.name.toLowerCase()} (${Math.round(low.score)}%). ${TIPS[low.name] ?? ''}`
}
