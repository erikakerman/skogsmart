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
  { to: '/dashboard', label: 'Översikt',     icon: LayoutDashboard },
  { to: '/karta',     label: 'Karta',         icon: Map },
  { to: '/enheter',   label: 'Enheter',       icon: Cpu },
  { to: '/larm',      label: 'Larm',          icon: BellDot },
  { to: '/installningar', label: 'Inställningar', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <TreePine className="sidebar-logo__icon" size={19} />
        <div>
          <div className="sidebar-logo__name">Skogsmart</div>
          <div className="sidebar-logo__sub">Smart²</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-nav__item${isActive ? ' sidebar-nav__item--active' : ''}`
            }
          >
            <Icon className="sidebar-nav__icon" size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">Smart² v0.1.0</div>
    </aside>
  )
}
