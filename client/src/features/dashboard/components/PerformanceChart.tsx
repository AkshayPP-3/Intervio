import{
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const performanceData = [
  { month: 'Jun', score: 55 },
  { month: 'Jul', score: 65 },
  { month: 'Aug', score: 60 },
  { month: 'Sep', score: 75 },
  { month: 'Oct', score: 82 },
  { month: 'Nov', score: 90 },
]

export function PerformanceChart(){
  return (
    <div className='bg-white border border-slate-200 rounded-xl p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h3 className='text-lg font-semibold text-slate-900'>
            Performance Overview
          </h3>

          <p className='text-sm text-slate-500 mt-1'>
            Your interview scores over time
          </p>
        </div>

        <span className='text-xs font-medium text-violet-600 bg-violet-50 px-3 py-2 rounded-lg'>
          Last 6 Months
        </span>
      </div>

      <div className='w-full h-72'>
        <LineChart
        data = {performanceData}
        responsive
        style ={{width:'100%', height:'100%'}}
        margin = {{top: 10, right:12, left: -15, bottom: 0}}
        >
          <CartesianGrid 
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
          />

          <XAxis 
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
          />

          <YAxis 
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
          />

          <Tooltip 
          formatter={(value) => [`${value}%`, 'Score']}
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            }}
          />
          <Line 
          type="monotone"
          dataKey="score"
          stroke="#7c3aed"
          strokeWidth={3}
          dot={{ r: 4, fill: '#7c3aed' }}
          activeDot={{ r: 6 }}
          />
        </LineChart>
      </div>
    </div>
  )
}