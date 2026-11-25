import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/common/Navbar'
import { Sidebar } from '../components/common/Sidebar'

/** Sidebar + top bar for every normal page. Pages render inside <Outlet />. */
export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-[#071020] text-slate-100">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
