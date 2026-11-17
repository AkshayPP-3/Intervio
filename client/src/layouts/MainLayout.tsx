import { Sidebar } from '../components/common/Sidebar'

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1">
          <header className='h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between'>
            <h1 className='text-xl font-semibold text-slate-800'>Dashboard</h1>
            <div className='text-sm text-slate-500'>Welcome back!</div>
          </header>
          
          <main className='p-8'>
            <h2 className='text-2xl font-bold text-slate-900'>Your Dashboard</h2>
            <p className='text-slate-500 mt-2'>
              Track your progress and prepare for your next interview.
            </p>
          </main>
        </div>
    </div>
  )
}
