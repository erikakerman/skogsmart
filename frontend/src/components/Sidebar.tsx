import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  Cpu,
  BellDot,
  Settings,
  TreePine,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Översikt', icon: LayoutDashboard },
  { to: '/karta', label: 'Karta', icon: Map },
  { to: '/enheter', label: 'Enheter', icon: Cpu },
  { to: '/larm', label: 'Larm', icon: BellDot },
  { to: '/installningar', label: 'Inställningar', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-green-950 text-green-50 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-green-800">
        <TreePine className="w-6 h-6 text-green-400" />
        <span className="text-lg font-bold tracking-wide text-white">Skogsmart</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-green-700 text-white'
                  : 'text-green-200 hover:bg-green-800 hover:text-white',
              ].join(' ')
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-green-800 text-xs text-green-500">
        Smart² v0.1.0
      </div>
    </aside>
  )
}
