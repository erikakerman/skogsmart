import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Översikt',
  '/karta': 'Karta',
  '/enheter': 'Enheter',
  '/larm': 'Larm',
  '/installningar': 'Inställningar',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'Skogsmart'

  return (
    <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-base font-semibold text-stone-700">{title}</h1>
      <button
        className="relative p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
        aria-label="Larm"
      >
        <Bell className="w-5 h-5" />
        {/* Notification badge */}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>
    </header>
  )
}
