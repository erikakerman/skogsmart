import { Bell } from 'lucide-react'

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar__actions">
        <button className="topbar__icon-btn" aria-label="Larm">
          <Bell size={16} />
          <span className="topbar__badge" />
        </button>
      </div>
    </header>
  )
}
