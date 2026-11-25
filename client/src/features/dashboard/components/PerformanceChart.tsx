import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export type PerformancePoint = { day: string; score: number }

type PerformanceChartProps = {
  data: PerformancePoint[]
  /** Shown when there are no scores yet. */
  emptyText?: string
}

export function PerformanceChart({ data, emptyText = 'No scores yet. Complete an interview to see your trend.' }: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-slate-700/60 px-4 text-center">
        <p className="max-w-xs text-xs text-slate-400">{emptyText}</p>
      </div>
    )
  }
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#cbd5e1' }} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#cbd5e1' }}
          />
          <Tooltip
            formatter={(v) => [`${v}%`, 'Score']}
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#60a5fa"
            strokeWidth={3}
            dot={{ r: 4, fill: '#60a5fa' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
