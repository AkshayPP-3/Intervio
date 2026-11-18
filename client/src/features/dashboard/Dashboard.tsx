import {StatsCard} from './components/StatsCard';
import {RecentInterviews} from './components/RecentInterviews';
import {PerformanceChart} from './components/PerformanceChart';
const stats = [
  { title: "Total Interviews", value: 12 },
  { title: "Average Score", value: "85%" },
  { title: "Completed", value: 8 },
  { title: "Pending", value: 4 },
]

export function Dashboard(){
  return (
    <div>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-slate-900'>
          Your Dashboard
        </h2>
        <p className='text-slate-500 mt-2'>
          Track your progress and prepare for your next interview.
        </p>
      </div>
      <div className='grid grid-cols-2 gap-6'>
        {stats.map((stat)=>(
          <StatsCard
          key = {stat.title}
          title = {stat.title}
          value = {stat.value}
          />
        ))}
      </div>
      <div className="mt-8">
        <RecentInterviews />
      </div>
      <div className="mt-8">
        <PerformanceChart />
      </div>
    </div>
  )
}

