import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { errorMessage } from '../../services/api'
import {
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  PRACTICE_CATEGORIES,
  evaluatePracticeAnswers,
  generatePracticeQuestions,
} from './practice.service'
import type { PracticeQuestion, PracticeResult, PracticeTopic } from './practice.service'

type Screen = 'setup' | 'test' | 'results'

export function Practice() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('setup')
  const [categoryKey, setCategoryKey] = useState<string | null>(null)
  const [topicKey, setTopicKey] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(MIN_QUESTIONS)
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<PracticeResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [busy, setBusy] = useState<'generating' | 'evaluating' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const category = PRACTICE_CATEGORIES.find((item) => item.key === categoryKey)
  const selectedTopic: PracticeTopic | undefined = category?.groups
    .flatMap((item) => item.topics)
    .find((item) => item.key === topicKey)
  const currentQuestion = questions[currentIndex]
  const averageScore = results.length
    ? results.reduce((total, result) => total + result.score, 0) / results.length
    : 0

  async function startTest() {
    if (!category || !selectedTopic || busy) {
      setError('Choose a practice area and topic before starting.')
      return
    }

    setBusy('generating')
    setError(null)
    try {
      const generated = await generatePracticeQuestions(selectedTopic.topic, questionCount)
      if (
        generated.length !== questionCount ||
        generated.some((item) => !item.id || !item.question.trim())
      ) {
        throw new Error(`Intervio did not return exactly ${questionCount} valid questions. Please try again.`)
      }

      setQuestions(generated)
      setAnswers(Object.fromEntries(generated.map((item) => [item.id, ''])))
      setResults([])
      setCurrentIndex(0)
      setScreen('test')
    } catch (e) {
      setError(errorMessage(e, 'Could not prepare your practice test. Please try again.'))
    } finally {
      setBusy(null)
    }
  }

  async function submitTest() {
    if (!category || !selectedTopic || questions.length === 0 || busy) return

    setBusy('evaluating')
    setError(null)
    try {
      const evaluated = await evaluatePracticeAnswers(
        selectedTopic.topic,
        questions.map((item) => ({
          question: item.question,
          userAnswer: answers[item.id] ?? '',
        })),
      )
      if (
        evaluated.length !== questions.length ||
        evaluated.some((item) => !item.idealAnswer.trim() || !item.feedback.trim())
      ) {
        throw new Error('Intervio could not review every answer. Please submit the test again.')
      }

      setResults(evaluated)
      setScreen('results')
    } catch (e) {
      setError(errorMessage(e, 'Could not review your answers. Please try again.'))
    } finally {
      setBusy(null)
    }
  }

  function chooseAnotherTopic() {
    setScreen('setup')
    setTopicKey(null)
    setQuestions([])
    setAnswers({})
    setResults([])
    setCurrentIndex(0)
    setError(null)
  }

  const page = 'min-h-[calc(100vh-56px)] bg-[#071020] px-4 py-5 md:px-6'

  return (
    <div className={page}>
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-300">Practice by topic</p>
            <h1 className="mt-1 text-xl font-bold text-white">
              {screen === 'setup' ? 'Build your own practice test' : screen === 'test' ? 'Your practice test' : 'Test review'}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              Choose a subject and a specific topic, then set the number of questions. Your answers and ideal answers
              will be reviewed when you finish.
            </p>
          </div>
          {screen !== 'setup' && (
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Exit practice
            </Button>
          )}
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        {screen === 'setup' && (
          <div className="grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)]">
            <section className="h-fit rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h2 className="text-sm font-bold text-white">1. Choose a subject</h2>
              <div className="mt-3 grid gap-2">
                {PRACTICE_CATEGORIES.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={categoryKey === item.key}
                    onClick={() => {
                      setCategoryKey(item.key)
                      setTopicKey(null)
                    }}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                      categoryKey === item.key
                        ? 'border-blue-400 bg-blue-500/10 text-white'
                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span aria-hidden="true" className="text-lg">{item.icon}</span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{item.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">{item.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <div className="space-y-4">
              <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-white">2. Choose a topic</h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {category ? `Select one topic under ${category.label}.` : 'Choose a subject to see its topics.'}
                    </p>
                  </div>
                  {selectedTopic && (
                    <span className="rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
                      {selectedTopic.label}
                    </span>
                  )}
                </div>
                {category ? (
                  <div className="mt-4 space-y-4">
                    {category.groups.map((topicGroup) => (
                      <div key={topicGroup.key}>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
                          {topicGroup.label}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {topicGroup.topics.map((topic) => (
                            <button
                              key={topic.key}
                              type="button"
                              aria-pressed={topicKey === topic.key}
                              onClick={() => setTopicKey(topic.key)}
                              className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                                topicKey === topic.key
                                  ? 'border-blue-400 bg-blue-500 text-white'
                                  : 'border-slate-600 bg-slate-900 text-slate-300 hover:border-slate-400 hover:text-white'
                              }`}
                            >
                              {topic.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-lg border border-dashed border-slate-600 px-4 py-8 text-center text-sm text-slate-400">
                    Select a subject to browse its topics.
                  </p>
                )}
              </section>

              <section className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-slate-700 bg-slate-800 p-4 md:p-5">
                <div className="min-w-64 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-bold text-white">3. Set question count</h2>
                      <p className="mt-1 text-xs text-slate-400">Choose between {MIN_QUESTIONS} and {MAX_QUESTIONS} questions.</p>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      Questions
                      <input
                        type="number"
                        min={MIN_QUESTIONS}
                        max={MAX_QUESTIONS}
                        step={1}
                        value={questionCount}
                        aria-label="Number of questions"
                        onChange={(event) => {
                          const value = event.currentTarget.valueAsNumber
                          if (Number.isFinite(value)) {
                            setQuestionCount(Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, Math.round(value))))
                          }
                        }}
                        className="h-9 w-20 rounded-md border border-slate-600 bg-slate-900 px-2 text-center text-sm font-semibold text-white outline-none focus:border-blue-400"
                      />
                    </label>
                  </div>
                  <input
                    type="range"
                    min={MIN_QUESTIONS}
                    max={MAX_QUESTIONS}
                    step={1}
                    value={questionCount}
                    aria-label="Adjust question count"
                    onChange={(event) => setQuestionCount(Number(event.currentTarget.value))}
                    className="mt-4 w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{MIN_QUESTIONS}</span>
                    <span>{MAX_QUESTIONS}</span>
                  </div>
                </div>
                <Button
                  size="md"
                  disabled={!selectedTopic || busy !== null}
                  loading={busy === 'generating'}
                  onClick={() => void startTest()}
                  className="min-w-40"
                >
                  {busy === 'generating' ? 'Preparing test…' : `Start ${questionCount}-question test`}
                </Button>
              </section>
            </div>
          </div>
        )}

        {screen === 'test' && currentQuestion && (
          <section className="mx-auto max-w-4xl rounded-xl border border-slate-700 bg-slate-800 p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-blue-300">{category?.label} · {selectedTopic?.label}</p>
                <h2 className="mt-2 text-sm font-semibold text-white">
                  Question {currentIndex + 1} of {questions.length}
                </h2>
              </div>
              <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">
                {Object.values(answers).filter((answer) => answer.trim()).length} answered
              </span>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-900">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            <nav aria-label="Test questions" className="mt-4 flex flex-wrap gap-2">
              {questions.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Go to question ${index + 1}${answers[item.id]?.trim() ? ', answered' : ', unanswered'}`}
                  aria-current={currentIndex === index ? 'step' : undefined}
                  onClick={() => setCurrentIndex(index)}
                  className={`size-9 rounded-md border text-xs font-semibold transition ${
                    currentIndex === index
                      ? 'border-blue-400 bg-blue-500 text-white'
                      : answers[item.id]?.trim()
                        ? 'border-blue-400/50 bg-blue-500/10 text-blue-200'
                        : 'border-slate-600 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </nav>

            <div className="mt-5 rounded-lg border border-slate-700 bg-slate-900 p-4 md:p-5">
              <p className="text-base font-semibold leading-7 text-white">{currentQuestion.question}</p>
              <label htmlFor="practice-answer" className="mt-5 block text-xs font-semibold text-slate-300">
                Your answer
              </label>
              <textarea
                id="practice-answer"
                value={answers[currentQuestion.id] ?? ''}
                onChange={(event) =>
                  setAnswers((previous) => ({ ...previous, [currentQuestion.id]: event.currentTarget.value }))
                }
                maxLength={5000}
                rows={7}
                placeholder="Write your answer here. You can leave a question blank and review its ideal answer after submitting."
                className="mt-2 w-full resize-y rounded-md border border-slate-600 bg-slate-800 p-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="secondary"
                disabled={currentIndex === 0 || busy !== null}
                onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              >
                Previous
              </Button>
              {currentIndex < questions.length - 1 ? (
                <Button onClick={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))}>
                  Next question
                </Button>
              ) : (
                <Button loading={busy === 'evaluating'} disabled={busy !== null} onClick={() => void submitTest()}>
                  {busy === 'evaluating' ? 'Reviewing answers…' : 'Submit and see answers'}
                </Button>
              )}
            </div>
            {busy === 'evaluating' && (
              <p role="status" className="mt-3 text-center text-xs text-blue-200">
                Intervio is checking your answers and preparing an ideal answer for each question.
              </p>
            )}
          </section>
        )}

        {screen === 'results' && (
          <div className="mx-auto max-w-5xl">
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-800 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Practice complete</p>
                <h2 className="mt-1 text-lg font-bold text-white">{category?.label} · {selectedTopic?.label}</h2>
                <p className="mt-1 text-xs text-slate-400">{results.length} questions reviewed</p>
              </div>
              <div className="rounded-lg border border-slate-600 bg-slate-900 px-5 py-3 text-center">
                <p className="text-2xl font-bold text-white">{averageScore.toFixed(1)}<span className="text-base text-slate-400">/10</span></p>
                <p className="text-[11px] text-slate-400">Average score</p>
              </div>
            </section>

            <div className="mt-4 space-y-3">
              {results.map((result, index) => (
                <article key={`${index}-${result.question}`} className="rounded-xl border border-slate-700 bg-slate-800 p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-xs font-semibold text-blue-300">Question {index + 1}</h3>
                    <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-white">
                      {result.score}/10
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white">{result.question}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg bg-slate-900 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Your answer</p>
                      <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-200">
                        {result.userAnswer.trim() || 'No answer entered.'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-900 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-300">
                        Correct answer / ideal answer
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-200">{result.idealAnswer}</p>
                    </div>
                  </div>
                  <p className="mt-3 rounded-lg border border-slate-700 px-3 py-2 text-xs leading-5 text-slate-300">
                    <span className="font-semibold text-white">Feedback: </span>{result.feedback}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={chooseAnotherTopic}>
                Choose another topic
              </Button>
              <Button onClick={() => void startTest()} disabled={busy !== null} loading={busy === 'generating'}>
                {busy === 'generating' ? 'Preparing…' : 'Practice this topic again'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
