import { Sidebar } from '../components/common/Sidebar'
import { Dashboard } from '../features/dashboard/Dashboard'

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
            <Dashboard />
          </main>
        </div>
    </div>
  )
}
