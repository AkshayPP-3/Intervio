interface StatsCardProps{
  title: string;
  value: string | number;
}
export function StatsCard({title, value}: StatsCardProps){
  return(
    <div className="bg-white p-6 rounded-xl border-slate-200">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
  )
}