import { NavLink } from 'react-router-dom';
const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { name: 'Interviews', path: '/interviews', icon: 'mic' },
  { name: 'Practice', path: '/practice', icon: 'practice' },
  { name: 'AI Assistant', path: '/ai-assistant', icon: 'spark' },
  { name: 'Reports', path: '/reports', icon: 'reports' },
  { name: 'Resume', path: '/resume', icon: 'resume' },
  { name: 'Leaderboard', path: '/leaderboard', icon: 'trophy' },
  { name: 'Settings', path: '/settings', icon: 'settings' },
]

function NavIcon({ type }: { type: string }) {
  const common = { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7 }
  if (type === 'dashboard') return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (type === 'mic') return <svg {...common}><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/></svg>
  if (type === 'practice') return <svg {...common}><path d="M4 4h16v16H4zM8 8h8M8 12h5M8 16h3"/></svg>
  if (type === 'spark') return <svg {...common}><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></svg>
  if (type === 'reports') return <svg {...common}><path d="M5 20V10M12 20V4M19 20v-7"/></svg>
  if (type === 'resume') return <svg {...common}><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6"/></svg>
  if (type === 'trophy') return <svg {...common}><path d="M8 4h8v4a4 4 0 0 1-8 0V4ZM12 12v5M8 21h8M9 17h6v4H9zM8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4"/></svg>
  return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L7.6 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.4a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5H15v.4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V14H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>
}

export function Sidebar() {
  return (
    <aside className="relative flex min-h-screen w-40 shrink-0 flex-col bg-slate-900 text-white">
      <div className="flex h-14 items-center px-4">
        <h2 className="text-sm font-bold">
          Intervio
        </h2>
      </div>

      <nav className="flex flex-col">
        {navItems.map((item)=>(
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex h-9 items-center gap-3 px-4 text-xs transition ${
                isActive ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="flex w-3 justify-center"><NavIcon type={item.icon} /></span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-4 left-0 px-4 text-xs leading-4 text-slate-400">
        <div className="font-semibold text-white">Daily goal</div>
        <div>1 interview or 3 practice sets</div>
      </div>
    </aside>
  );
}
