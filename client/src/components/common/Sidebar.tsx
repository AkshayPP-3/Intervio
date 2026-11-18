import { NavLink } from 'react-router-dom';
const navItems = [
  {name: 'Dashboard', path: '/dashboard'},
  { name: 'Interviews', path: '/interviews' },
  { name: 'Practice', path: '/practice' },
  { name: 'AI Assistant', path: '/ai-assistant' },
  { name: 'Reports', path: '/reports' },
  { name: 'Resume', path: '/resume' },
  { name: 'Leaderboard', path: '/leaderboard' },
  { name: 'Settings', path: '/settings' },
]
export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white p-6">
      <div className="mb-10">
        <h2 className="text-2xl font-bold tracking-wide">
          Intervio
        </h2>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item)=>(
          <NavLink
          key = {item.name}
          to = {item.path}
          end = {item.path==='/dashboard'}
          className={({isActive})=>
          `px-4 py-3 rounded-lg text-sm font-medium transition ${
            isActive?'bg-violet-600 text-white': 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`
          }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
