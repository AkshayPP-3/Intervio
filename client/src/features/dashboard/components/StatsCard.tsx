type StatsCardProps = {
  title: string
  value: string | number
  hint?: string
}

export function StatsCard({ title, value, hint }: StatsCardProps) {
  return (
    <div className="min-h-[86px] rounded-lg border border-slate-800/90 bg-slate-800/95 px-3 py-3">
      <p className="text-[11px] text-slate-300">{title}</p>
      <p className="mt-2 text-[21px] leading-none font-bold text-white">{value}</p>
      {hint && <p className="mt-2 text-[10px] text-slate-400">{hint}</p>}
    </div>
  )
}
