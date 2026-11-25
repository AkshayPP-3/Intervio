import { api } from '../../services/api'
import type { DashboardData, Interview } from '../../types/interview.types'

export const getDashboard = () => api.get<DashboardData>('/dashboard')

/**
 * "Questions answered": every completed interview has all questions answered
 * (the evaluator requires it), so we add up their questions. The dashboard
 * endpoint does not return this, so it takes a few extra requests.
 */
export async function countAnsweredQuestions(): Promise<number> {
  const all = await api.get<Interview[]>('/interviews')
  const done = all.filter((i) => i.status === 'COMPLETED').slice(0, 20)
  const results = await Promise.allSettled(done.map((i) => api.get<{ questions?: unknown[] }>(`/interviews/${i.id}`)))
  return results.reduce((sum, r) => (r.status === 'fulfilled' ? sum + (r.value.questions?.length ?? 0) : sum), 0)
}
