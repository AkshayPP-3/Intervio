const interviews = [
  {
    id:1,
    role:'Frontend developer',
    date:'Nov 16, 2026',
    score:'88%',
    status:'Completed',
  },
  {
    id:2,
    role:'Backend developer',
    date:'Nov 14, 2026',
    score:null,
    status:'Pending',
  },
  {
    id:3,
    role:'Full Stack developer',
    date:'Nov 12, 2026',
    score:'92%',
    status:'Completed',
  },
]

export function RecentInterviews(){
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slte-900">
          Recent Interviews
        </h3>

        <button className="text-sm text-violet-600 font-medium hover:text-violet-700">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {interviews.map((interview)=>(
          <div key = {interview.id} className="flex items-center justify-between 
          border border-slate-100 pb-4 last:border-0 last:pb-0">
            <div>
              <h4 className="font-medium text-slate-800">
                {interview.role}
              </h4>

              <p className="text-sm text-slate-500 mt-1">
                {interview.date}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-800">
                {interview.score ?? 'Not Evaluated'}
              </p>

              <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                interview.status === 'Completed' ? 'bg-green-100 text-green-700': 'bg-amber-100 text-amber-700'
              }`}>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}