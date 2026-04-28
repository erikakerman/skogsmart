import { useState } from 'react'
import { Search, TreePine, BatteryMedium } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DeviceStatus = 'online' | 'varning' | 'offline'
type Area = 'Hovmansbygd' | 'Siggaboda' | 'Haraholmen'

interface Device {
  id: string
  area: Area
  status: DeviceStatus
  jordFuktighet: number
  markTemperatur: number
  battery: number
  temp: number
  humidity: number
  lastSeen: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const devices: Device[] = [
  { id: 'SK-001', area: 'Hovmansbygd', status: 'online',  jordFuktighet: 62, markTemperatur: 9.1, battery: 87, temp: 17.1, humidity: 71, lastSeen: '2026-03-04 07:40' },
  { id: 'SK-002', area: 'Hovmansbygd', status: 'online',  jordFuktighet: 58, markTemperatur: 8.8, battery: 92, temp: 16.8, humidity: 69, lastSeen: '2026-03-04 07:38' },
  { id: 'SK-003', area: 'Hovmansbygd', status: 'online',  jordFuktighet: 65, markTemperatur: 9.3, battery: 74, temp: 17.3, humidity: 73, lastSeen: '2026-03-04 07:35' },
  { id: 'SK-004', area: 'Siggaboda',   status: 'online',  jordFuktighet: 31, markTemperatur: 8.2, battery: 81, temp: 16.4, humidity: 78, lastSeen: '2026-03-04 08:12' },
  { id: 'SK-005', area: 'Siggaboda',   status: 'online',  jordFuktighet: 28, markTemperatur: 8.0, battery: 65, temp: 16.0, humidity: 79, lastSeen: '2026-03-04 07:55' },
  { id: 'SK-006', area: 'Siggaboda',   status: 'varning', jordFuktighet: 21, markTemperatur: 8.5, battery: 58, temp: 16.5, humidity: 76, lastSeen: '2026-03-04 06:58' },
  { id: 'SK-007', area: 'Siggaboda',   status: 'varning', jordFuktighet: 34, markTemperatur: 8.1, battery: 18, temp: 16.1, humidity: 80, lastSeen: '2026-03-04 05:30' },
  { id: 'SK-008', area: 'Haraholmen',  status: 'online',  jordFuktighet: 68, markTemperatur: 7.8, battery: 72, temp: 15.8, humidity: 82, lastSeen: '2026-03-04 07:55' },
  { id: 'SK-009', area: 'Haraholmen',  status: 'online',  jordFuktighet: 71, markTemperatur: 7.6, battery: 60, temp: 15.6, humidity: 84, lastSeen: '2026-03-04 06:20' },
  { id: 'SK-010', area: 'Haraholmen',  status: 'offline', jordFuktighet: 55, markTemperatur: 7.9, battery: 34, temp: 15.9, humidity: 81, lastSeen: '2026-03-03 14:42' },
  { id: 'SK-011', area: 'Haraholmen',  status: 'varning', jordFuktighet: 23, markTemperatur: 7.7, battery: 41, temp: 15.7, humidity: 83, lastSeen: '2026-03-04 07:10' },
  { id: 'SK-012', area: 'Haraholmen',  status: 'varning', jordFuktighet: 62, markTemperatur: 8.0, battery: 17, temp: 16.0, humidity: 80, lastSeen: '2026-03-04 06:45' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function batteryClass(battery: number) {
  if (battery > 50) return { pct: 'battery-pct--ok',      fill: 'battery-fill--ok' }
  if (battery >= 20) return { pct: 'battery-pct--warning', fill: 'battery-fill--warning' }
  return { pct: 'battery-pct--danger', fill: 'battery-fill--danger' }
}

// ─── Status indicator ─────────────────────────────────────────────────────────

function DeviceStatusDot({ status }: { status: DeviceStatus }) {
  const dotClass = status === 'online' ? 'status-dot--online' : status === 'varning' ? 'status-dot--varning' : 'status-dot--offline'
  const label = status === 'online' ? 'Online' : status === 'varning' ? 'Varning' : 'Offline'
  return (
    <div className="status-dot-wrap">
      <span className={`status-dot ${dotClass}`} />
      <span className="status-label">{label}</span>
    </div>
  )
}

// ─── Device card ──────────────────────────────────────────────────────────────

function DeviceCard({ device }: { device: Device }) {
  const bat = batteryClass(device.battery)

  return (
    <div className={`device-card device-card--${device.status}`}>
      <div className="device-card__header">
        <span className="device-card__id">{device.id}</span>
        <DeviceStatusDot status={device.status} />
      </div>

      <div className="device-card__area">
        <TreePine size={13} className="device-card__area-icon" />
        <span>{device.area}</span>
      </div>

      <div className="device-card__stats">
        <div>
          <p className="device-stat__label">Jordfuktighet</p>
          <p className={`device-stat__value${device.jordFuktighet < 25 ? ' device-stat__value--warning' : ''}`}>
            {device.jordFuktighet}%
          </p>
        </div>
        <div>
          <p className="device-stat__label">Marktemperatur</p>
          <p className="device-stat__value">{device.markTemperatur.toFixed(1)} °C</p>
        </div>
        <div>
          <p className="device-stat__label">Luftfuktighet</p>
          <p className="device-stat__value">{device.humidity}%</p>
        </div>
        <div>
          <p className="device-stat__label">Senast sedd</p>
          <p className="device-stat__value device-stat__value--small">{device.lastSeen}</p>
        </div>
      </div>

      <div>
        <div className="battery-header">
          <span className="battery-label">
            <BatteryMedium size={12} />
            Batteri
          </span>
          <span className={`battery-pct ${bat.pct}`}>{device.battery}%</span>
        </div>
        <div className="battery-track">
          <div className={`battery-fill ${bat.fill}`} style={{ width: `${device.battery}%` }} />
        </div>
      </div>

      <button className="detail-btn">Visa detaljer</button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    <div className="page">
      <div className="pill-row">
        <span className="pill pill--neutral">{devices.length} Totalt</span>
        <span className="pill pill--green">{countOnline} Online</span>
        <span className="pill pill--amber">{countVarning} Varning</span>
        <span className="pill pill--red">{countOffline} Offline</span>
      </div>

      <div className="field-wrap">
        <span className="field-icon"><Search size={15} /></span>
        <input
          type="text"
          placeholder="Sök enhet eller område..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
      </div>

      <p className="result-count">Visar {filtered.length} av {devices.length} enheter</p>

      <div className="device-grid">
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state__icon"><Search size={38} /></div>
            <p className="empty-state__text">Ingen enhet matchar sökningen</p>
          </div>
        ) : (
          filtered.map((device) => <DeviceCard key={device.id} device={device} />)
        )}
      </div>
    </div>
  )
}
