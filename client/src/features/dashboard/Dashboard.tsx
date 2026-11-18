export function Dashboard() {
  const stats = [
    { title: 'Total interviews', value: '0' },
    { title: 'Average score', value: '0%' },
    { title: 'Questions answered', value: '0' },
    { title: 'Practice time', value: '0 min' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg font-bold leading-6 text-white">Overview</h1>
          <p className="mt-2 text-xs leading-4 text-blue-300">Welcome back, Akshay. Take your first interview to see your stats.</p>
        </div>
        <button className="mt-4 h-8 rounded border-0 bg-slate-800 px-3 text-xs text-blue-400">
          View full report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="min-h-18 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
            <p className="text-xs leading-4 text-slate-300">{stat.title}</p>
            <p className="mt-2 text-xl font-bold leading-6 text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="min-h-240px rounded-lg border border-slate-700 bg-slate-800 px-4 py-4 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="min-w-0 text-sm font-bold text-white">Score trend (last 7 days)</h2>
            <button className="h-8 shrink-0 rounded bg-slate-700 px-2 text-xs text-blue-400">Load demo data</button>
          </div>
          <div className="relative mt-2 h-36 overflow-hidden border-b border-slate-600">
            <div className="absolute bottom-6 left-0 right-0 h-px bg-slate-700"></div>
            <div className="absolute inset-x-0 -bottom-6 grid grid-cols-7 text-center text-xs text-slate-300">
              {['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
          <section className="min-h-112px rounded-lg border border-slate-700 bg-slate-800 p-4">
            <h2 className="text-sm font-bold text-white">Strengths and weaknesses</h2>
            <p className="mt-3 text-xs leading-5 text-slate-400">Skill analysis appears after your first interview.</p>
          </section>
          <section className="flex min-h-112px flex-col rounded-lg border border-slate-700 bg-slate-800 p-4">
            <h2 className="text-sm font-bold text-white">AI suggestion</h2>
            <p className="mt-2 text-xs leading-5 text-slate-400">Upload your resume first so Gemini can ask questions about your real projects.</p>
            <button className="mt-auto h-7 w-fit rounded bg-blue-500 px-3 text-xs font-semibold text-white">Upload resume</button>
          </section>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="min-h-24 rounded-lg border border-slate-700 bg-slate-800 px-4 py-4 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white">Interview history</h2>
            <button className="h-8 rounded bg-slate-700 px-2 text-xs text-blue-400">New interview</button>
          </div>
          <p className="mt-2 text-xs text-slate-400">No interviews yet. Your history will appear here.</p>
        </section>

        <section className="min-h-24 rounded-lg border border-slate-700 bg-slate-800 p-4">
          <h2 className="text-sm font-bold text-white">Quick practice</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {['Aptitude', 'Coding / DSA', 'HR and Behavioural', 'Communication'].map((item) => (
              <button key={item} className="h-6 rounded bg-slate-700 px-2 text-xs text-white">{item}</button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

