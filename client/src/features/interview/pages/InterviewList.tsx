import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../dashboard/Dashboard'
import { createInterview } from '../interview.service'

type InterviewListItem = {
  id: string
  status: string
}

const streams = [
  { name: 'Frontend', detail: 'React, TypeScript, web fundamentals', role: 'Frontend Developer' },
  { name: 'Backend', detail: 'APIs, databases, system design', role: 'Backend Developer' },
  { name: 'Full mock', detail: 'Mixed rounds: resume, DSA and architecture', role: 'Full Stack Developer' },
  { name: 'Aptitude', detail: 'Quantitative and logical reasoning', role: 'Aptitude' },
  { name: 'Communication', detail: 'Clarity, storytelling, tone', role: 'Communication' },
  { name: 'Technical', detail: 'Core concepts for your role', role: 'Software Engineer' },
  { name: 'HR and Behavioural', detail: 'Situational and culture fit', role: 'Behavioural and HR' },
  { name: 'System Design', detail: 'Trade-offs, scalability and architecture', role: 'System Design' },
  { name: 'Group Discussion', detail: 'Opinions and persuasion', role: 'Group Discussion' },
]

const templates = [
  { name: 'Campus placement', detail: 'Full mock · Beginner', role: 'Software Engineer', difficulty: 'Beginner' },
  { name: 'Product company', detail: 'Technical · Advanced', role: 'Product Engineer', difficulty: 'Advanced' },
  { name: 'Service company', detail: 'Full mock · Intermediate', role: 'Software Developer', difficulty: 'Intermediate' },
  { name: 'Startup specialist', detail: 'HR and Behavioural · Intermediate', role: 'Startup Specialist', difficulty: 'Intermediate' },
]

export function InterviewList() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [role, setRole] = useState('Frontend Developer')
  const [difficulty, setDifficulty] = useState('Intermediate')
  const [language, setLanguage] = useState('English')
  const [questions, setQuestions] = useState('5')
  const [interviewStyle, setInterviewStyle] = useState('Friendly')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeStream, setActiveStream] = useState('Frontend')

  useEffect(() => {
    void apiRequest<InterviewListItem[]>('/interviews').catch(() => undefined)
  }, [])

  function selectStream(stream: (typeof streams)[number]) {
    setActiveStream(stream.name)
    setRole(stream.role)
  }

  function selectTemplate(template: (typeof templates)[number]) {
    setRole(template.role)
    setDifficulty(template.difficulty)
  }

  async function start(e: FormEvent) {
    e.preventDefault()
    if (!role.trim()) {
      setError('Please enter a role or stream.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const id = await createInterview({
        title: title.trim() || `${role.trim()} mock interview`,
        role: role.trim(),
        difficulty,
        language,
      })
      navigate(`/interviews/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the interview.')
      setBusy(false)
    }
  }

  const field =
    'mt-1 h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 outline-none focus:border-blue-400'

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#071020] px-4 py-4 md:px-5">
      <div>
        <h1 className="text-[15px] font-bold text-white">Interviews</h1>
        <p className="mt-1 text-xs text-slate-400">Configure a mock interview. Restarting at any point in your journey.</p>
      </div>

      <form onSubmit={start} className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {streams.map((stream) => {
              const active = activeStream === stream.name
              return (
                <button
                  key={stream.name}
                  type="button"
                  onClick={() => selectStream(stream)}
                  className={`min-h-[72px] rounded-md border p-3 text-left transition ${
                    active
                      ? 'border-blue-400/70 bg-slate-800/90 shadow-[0_0_0_1px_rgba(96,165,250,0.12)]'
                      : 'border-slate-700/90 bg-slate-800/80 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <span className={`block text-xs font-semibold ${active ? 'text-blue-300' : 'text-slate-100'}`}>
                    {stream.name}
                  </span>
                  <span className="mt-1 block text-[11px] leading-4 text-slate-400">{stream.detail}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Difficulty
              <span className="mt-1 flex h-9 items-center rounded-md border border-slate-700 bg-slate-900 p-1">
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`h-7 flex-1 rounded-md text-[11px] normal-case tracking-normal transition ${
                      difficulty === level ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </span>
            </label>

            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Language
              <select className={field} value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
              </select>
            </label>

            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Interview style
              <select
                className={field}
                value={interviewStyle}
                onChange={(e) => setInterviewStyle(e.target.value)}
              >
                <option>Friendly</option>
                <option>Formal</option>
                <option>Challenging</option>
              </select>
            </label>

            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Questions
              <select className={field} value={questions} onChange={(e) => setQuestions(e.target.value)}>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="8">8</option>
                <option value="10">10</option>
              </select>
            </label>

            <label className="sm:col-span-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Custom role or stream
              <input
                className={field}
                value={role}
                onChange={(e) => {
                  setRole(e.target.value)
                  setActiveStream('')
                }}
                maxLength={100}
                placeholder="Frontend Developer"
              />
            </label>

            <label className="sm:col-span-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Interview title
              <input
                className={field}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder={`${role.trim() || 'Role'} mock interview`}
              />
            </label>
          </div>

          {error && (
            <p role="alert" className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">Full mock · {questions} questions · {language}</p>
            <button
              type="submit"
              disabled={busy}
              className="h-9 rounded-md bg-blue-500 px-4 text-xs font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Starting…' : 'Start interview'}
            </button>
          </div>
        </div>

        <aside className="grid gap-3 lg:gap-4">
          <section className="rounded-lg border border-slate-800 bg-slate-800/70 p-3">
            <h2 className="text-[11px] font-semibold text-slate-100">Interview templates</h2>
            <div className="mt-2 grid gap-1.5">
              {templates.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => selectTemplate(template)}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-left hover:bg-slate-700/60"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-medium text-slate-100">{template.name}</span>
                    <span className="block truncate text-[10px] text-slate-400">{template.detail}</span>
                  </span>
                  <span className="shrink-0 rounded-md bg-slate-700 px-2 py-1 text-[9px] text-slate-300">Use</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-800/70 p-3">
            <h2 className="text-[11px] font-semibold text-slate-100">Before you start</h2>
            <ul className="mt-2 space-y-1.5 text-[10px] leading-4 text-slate-400">
              <li className="before:mr-1.5 before:text-slate-500 before:content-['▸']">Allow camera and microphone access</li>
              <li className="before:mr-1.5 before:text-slate-500 before:content-['▸']">Sit in a quiet, well-lit place</li>
              <li className="before:mr-1.5 before:text-slate-500 before:content-['▸']">Use headphones to reduce echo</li>
              <li className="before:mr-1.5 before:text-slate-500 before:content-['▸']">Speech recognition works best in English</li>
            </ul>
          </section>
        </aside>
      </form>
    </div>
  )
}
