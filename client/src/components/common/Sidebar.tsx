export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white p-6">
      <div className="mb-10">
        <h2 className="text-2xl font-bold tracking-wide">
          Intervio
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          AI Interview Preparation
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        <a href="#dashboard" className="px-4 py-3 rounded-lg bg-violet-600 text-white font-medium">
          Dashboard
        </a>

        <a href="#interviews" className="px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
          My Interviews
        </a>

        <a href="#resume" className="px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
          My Resume
        </a>

        <a href="#profile" className="px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
          Profile
        </a>
      </nav>
    </aside>
  );
}
