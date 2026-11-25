import { parseList } from '../../../utils/helpers'

type FeedbackSectionProps = {
  feedback: string | null
  strengths: string | null
  weaknesses: string | null
  /** Shown as a "next steps" box, e.g. advice for the weakest skill. */
  tip?: string | null
}

function List({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <section className="rounded-lg border border-slate-800/90 bg-slate-800/95 p-5">
      <h2 className={`text-xs font-bold ${tone}`}>{title}</h2>
      {items.length ? (
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-5 text-slate-300">
          {items.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-slate-400">None listed.</p>
      )}
    </section>
  )
}

export function FeedbackSection({ feedback, strengths, weaknesses, tip }: FeedbackSectionProps) {
  return (
    <div className="space-y-3">
      {feedback && (
        <section className="rounded-lg border border-slate-800/90 bg-slate-800/95 p-5">
          <h2 className="text-xs font-bold text-white">Feedback</h2>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-300">{feedback}</p>
        </section>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <List title="Strengths" items={parseList(strengths)} tone="text-emerald-300" />
        <List title="What to improve" items={parseList(weaknesses)} tone="text-amber-300" />
      </div>
      {tip && (
        <section className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-5">
          <h2 className="text-xs font-bold text-blue-200">Prepare for your next interview</h2>
          <p className="mt-2 text-xs leading-5 text-slate-200">{tip}</p>
        </section>
      )}
    </div>
  )
}
