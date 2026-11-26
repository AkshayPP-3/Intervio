export type InterviewStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

/** What the list endpoints return (no questions). */
export type Interview = {
  id: string
  title: string
  role: string
  difficulty: string | null
  language: string | null
  status: InterviewStatus
  createdAt: string
  updatedAt: string
}

export type Question = {
  id: string
  interviewId: string
  questionText: string
  questionType: string | null
  order: number
  answer?: Answer | null
}

export type Answer = {
  id: string
  questionId: string
  answerText: string | null
  audioUrl: string | null
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

export type InterviewDetail = Omit<Interview, 'updatedAt'> & {
  updatedAt?: string
  questions: Question[]
  evaluation: Evaluation | null
}

export type DashboardData = {
  stats: {
    totalInterviews: number
    completedInterviews: number
    inProgressInterviews: number
    answeredQuestions?: number
    averageScore: number | null
    bestScore: number | null
  }
  recentInterviews: Interview[]
  recentEvaluations: Evaluation[]
}
