import { mapLimit } from '../../utils/helpers'
import { getAnswer, getEvaluation, getInterview, listInterviews } from '../interview/interview.service'
import type { Evaluation, Interview, InterviewDetail, Question } from '../../types/interview.types'

export type Report = { interview: Interview; evaluation: Evaluation }

/**
 * Every completed interview with its evaluation, newest first.
 * The server has no "list evaluations" endpoint, so we fetch each one
 * (a few at a time) for the latest 40 completed interviews.
 */
export async function listReports(max = 40): Promise<Report[]> {
  const all = await listInterviews()
  const done = all.filter((i) => i.status === 'COMPLETED').slice(0, max)
  const evaluations = await mapLimit(done, 5, (i) => getEvaluation(i.id).catch(() => null))
  return done.flatMap((interview, k) => {
    const evaluation = evaluations[k]
    return evaluation ? [{ interview, evaluation }] : []
  })
}

export type ReportDetail = {
  interview: InterviewDetail
  questions: Question[]
  answers: Record<string, string>
}

/** Questions and the saved answers for one interview. */
export async function getReportDetail(interviewId: string): Promise<ReportDetail> {
  const interview = await getInterview(interviewId)
  const questions = [...interview.questions].sort((a, b) => a.order - b.order)
  const saved = await mapLimit(questions, 5, (q) => getAnswer(q.id).catch(() => null))
  const answers: Record<string, string> = {}
  questions.forEach((q, i) => {
    const text = saved[i]?.answerText
    if (text != null) answers[q.id] = text
  })
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
