import { clamp, pct } from '../../../utils/helpers'

type ScoreCardProps = {
  overall: number | null
  technical: number | null
  communication: number | null
  confidence: number | null
}

function Ring({ score }: { score: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const value = clamp(score)
  return (
    <svg width="132" height="132" viewBox="0 0 132 132" role="img" aria-label={`Overall score ${Math.round(value)} percent`}>
      <circle cx="66" cy="66" r={r} fill="none" stroke="#334155" strokeWidth="10" />
      <circle
        cx="66"
        cy="66"
        r={r}
        fill="none"
        stroke="#60a5fa"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`}
        transform="rotate(-90 66 66)"
      />
      <text x="66" y="66" textAnchor="middle" dominantBaseline="central" fontSize="30" fontWeight="700" fill="#fff">
        {Math.round(value)}
      </text>
    </svg>
  )
}

/** Overall score ring plus the three skill bars. */
export function ScoreCard({ overall, technical, communication, confidence }: ScoreCardProps) {
  const dims = [
    { key: 'Technical', value: technical },
    { key: 'Communication', value: communication },
    { key: 'Confidence', value: confidence },
  ]
  const scored = dims.filter((d): d is { key: string; value: number } => d.value != null)
  const weakest = scored.length ? scored.reduce((a, b) => (b.value < a.value ? b : a)).key : null

  return (
    <div className="grid gap-3 md:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800/90 bg-slate-800/95 p-5">
        {overall != null ? <Ring score={overall} /> : <p className="text-xs text-slate-400">No score</p>}
        <p className="mt-2 text-xs font-semibold text-white">Overall score</p>
      </div>
      <div className="rounded-lg border border-slate-800/90 bg-slate-800/95 p-5">
        <h2 className="text-xs font-bold text-white">Skill breakdown</h2>
        {dims.map((d) => (
          <div key={d.key} className="mt-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-200">{d.key}</span>
              <span className="text-slate-300">{pct(d.value)}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-700">
              <div
                className={`h-full rounded-full ${d.key === weakest ? 'bg-amber-400' : 'bg-blue-400'}`}
                style={{ width: `${clamp(d.value ?? 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
