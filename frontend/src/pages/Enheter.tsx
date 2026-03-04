import { useState } from 'react'
import { Search, TreePine, BatteryMedium } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DeviceStatus = 'online' | 'varning' | 'offline'
type Area = 'Hovmansbygd' | 'Siggaboda' | 'Haraholmen'

interface Device {
  id: string
  area: Area
  status: DeviceStatus
  latestCatch: number
  battery: number
  temp: number
  humidity: number
  lastSeen: string
}

// ─── Fake data ─────────────────────────────────────────────────────────────────

const devices: Device[] = [
  // Hovmansbygd — 3 devices, all Online, healthy batteries
  { id: 'SK-001', area: 'Hovmansbygd', status: 'online',  latestCatch: 2,  battery: 87, temp: 5.1, humidity: 71, lastSeen: '2026-03-04 07:40' },
  { id: 'SK-002', area: 'Hovmansbygd', status: 'online',  latestCatch: 3,  battery: 92, temp: 4.8, humidity: 69, lastSeen: '2026-03-04 07:38' },
  { id: 'SK-003', area: 'Hovmansbygd', status: 'online',  latestCatch: 1,  battery: 74, temp: 5.3, humidity: 73, lastSeen: '2026-03-04 07:35' },

  // Siggaboda — 4 devices; SK-006 Varning (high catch), SK-007 Varning (low battery)
  { id: 'SK-004', area: 'Siggaboda',   status: 'online',  latestCatch: 22, battery: 81, temp: 4.2, humidity: 78, lastSeen: '2026-03-04 08:12' },
  { id: 'SK-005', area: 'Siggaboda',   status: 'online',  latestCatch: 29, battery: 65, temp: 4.0, humidity: 79, lastSeen: '2026-03-04 07:55' },
  { id: 'SK-006', area: 'Siggaboda',   status: 'varning', latestCatch: 41, battery: 58, temp: 4.5, humidity: 76, lastSeen: '2026-03-04 06:58' },
  { id: 'SK-007', area: 'Siggaboda',   status: 'varning', latestCatch: 34, battery: 18, temp: 4.1, humidity: 80, lastSeen: '2026-03-04 05:30' },

  // Haraholmen — 5 devices; SK-010 Offline, SK-011 and SK-012 Varning
  { id: 'SK-008', area: 'Haraholmen',  status: 'online',  latestCatch: 45, battery: 72, temp: 3.8, humidity: 82, lastSeen: '2026-03-04 07:55' },
  { id: 'SK-009', area: 'Haraholmen',  status: 'online',  latestCatch: 38, battery: 60, temp: 3.6, humidity: 84, lastSeen: '2026-03-04 06:20' },
  { id: 'SK-010', area: 'Haraholmen',  status: 'offline', latestCatch: 12, battery: 34, temp: 3.9, humidity: 81, lastSeen: '2026-03-03 14:42' },
  { id: 'SK-011', area: 'Haraholmen',  status: 'varning', latestCatch: 33, battery: 41, temp: 3.7, humidity: 83, lastSeen: '2026-03-04 07:10' },
  { id: 'SK-012', area: 'Haraholmen',  status: 'varning', latestCatch: 19, battery: 27, temp: 4.0, humidity: 80, lastSeen: '2026-03-04 06:45' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function batteryColor(battery: number): string {
  if (battery > 50) return 'text-green-600'
  if (battery >= 20) return 'text-amber-600'
  return 'text-red-600'
}

function batteryBarColor(battery: number): string {
  if (battery > 50) return 'bg-green-500'
  if (battery >= 20) return 'bg-amber-500'
  return 'bg-red-500'
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: DeviceStatus
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<DeviceStatus, string> = {
    online:  'bg-green-100 text-green-700',
    varning: 'bg-amber-100 text-amber-700',
    offline: 'bg-red-100 text-red-700',
  }
  const labels: Record<DeviceStatus, string> = {
    online:  'Online',
    varning: 'Varning',
    offline: 'Offline',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

// ─── DeviceCard ───────────────────────────────────────────────────────────────

interface DeviceCardProps {
  device: Device
}

function DeviceCard({ device }: DeviceCardProps) {
  const topBorder: Record<DeviceStatus, string> = {
    online:  'border-t-4 border-t-green-500',
    varning: 'border-t-4 border-t-amber-500',
    offline: 'border-t-4 border-t-red-500 opacity-70',
  }

  return (
    <div
      className={`bg-white rounded-xl border border-stone-200 p-5 flex flex-col gap-4 ${topBorder[device.status]}`}
    >
      {/* Top row: ID + status */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-base font-bold text-stone-800">{device.id}</span>
        <StatusBadge status={device.status} />
      </div>

      {/* Area */}
      <div className="flex items-center gap-1.5 text-sm text-stone-500">
        <TreePine className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
        <span>{device.area}</span>
      </div>

      {/* Stats 2x2 */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
        <div>
          <p className="text-xs text-stone-400">Senaste fångst</p>
          <p className={`font-semibold ${device.latestCatch >= 20 ? 'text-amber-600' : 'text-stone-800'}`}>
            {device.latestCatch} skalbaggar
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-400">Temperatur</p>
          <p className="font-semibold text-stone-800">{device.temp.toFixed(1)} °C</p>
        </div>
        <div>
          <p className="text-xs text-stone-400">Luftfuktighet</p>
          <p className="font-semibold text-stone-800">{device.humidity} %</p>
        </div>
        <div>
          <p className="text-xs text-stone-400">Senast sedd</p>
          <p className="font-semibold text-stone-800 text-xs">{device.lastSeen}</p>
        </div>
      </div>

      {/* Battery bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <BatteryMedium className="w-3.5 h-3.5" /> Batteri
          </span>
          <span className={`text-xs font-semibold ${batteryColor(device.battery)}`}>
            {device.battery} %
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-stone-100">
          <div
            className={`h-1.5 rounded-full ${batteryBarColor(device.battery)}`}
            style={{ width: `${device.battery}%` }}
          />
        </div>
      </div>

      {/* Detail button */}
      <button className="mt-auto w-full text-sm text-green-700 border border-green-200 rounded-lg py-2 hover:bg-green-50 transition-colors font-medium">
        Visa detaljer
      </button>
    </div>
  )
}

// ─── Enheter (page) ───────────────────────────────────────────────────────────

export default function Enheter() {
  const [search, setSearch] = useState('')

  const filtered = devices.filter((d) => {
    const q = search.toLowerCase()
    return d.id.toLowerCase().includes(q) || d.area.toLowerCase().includes(q)
  })

  const countOnline  = devices.filter((d) => d.status === 'online').length
  const countVarning = devices.filter((d) => d.status === 'varning').length
  const countOffline = devices.filter((d) => d.status === 'offline').length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-stone-800">Enheter</h2>
        <p className="text-sm text-stone-500 mt-0.5">Alla sensornoder och deras aktuella status</p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-stone-100 text-stone-700">
          {devices.length} Totalt
        </span>
        <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700">
          {countOnline} Online
        </span>
        <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
          {countVarning} Varning
        </span>
        <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-700">
          {countOffline} Offline
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Sök enhet eller område..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-xl bg-white text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-700"
        />
      </div>

      {/* Results count */}
      <p className="text-xs text-stone-400">
        Visar {filtered.length} av {devices.length} enheter
      </p>

      {/* Device grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-stone-400">
            <Search className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p className="text-sm">Ingen enhet matchar sökningen</p>
          </div>
        ) : (
          filtered.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))
        )}
      </div>
    </div>
  )
}
