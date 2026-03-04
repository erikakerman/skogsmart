import { useState, useMemo } from 'react'
import { AlertOctagon, AlertTriangle, Info, CheckCircle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'larm' | 'varning' | 'info'
type AlertStatus = 'aktiv' | 'lost'
type Area = 'Hovmansbygd' | 'Siggaboda' | 'Haraholmen'

interface Alert {
  id: string
  severity: Severity
  title: string
  description: string
  deviceId: string
  area: Area
  timestamp: string
  status: AlertStatus
}

// ─── Fake data ────────────────────────────────────────────────────────────────

const initialAlerts: Alert[] = [
  {
    id: '1',
    severity: 'larm',
    title: 'Kritisk fångst – Siggaboda',
    description:
      'Fångstantal har överskridit kritisk nivå (>40 skalbaggar/dag). Omedelbar inspektion rekommenderas.',
    deviceId: 'SK-011',
    area: 'Siggaboda',
    timestamp: '2026-03-04 08:45',
    status: 'aktiv',
  },
  {
    id: '2',
    severity: 'larm',
    title: 'Kritisk fångst – Haraholmen sektor B',
    description:
      'Fångsttopp detekterad. Räknaren visar 45 skalbaggar under senaste 24-timmarsperioden.',
    deviceId: 'SK-007',
    area: 'Haraholmen',
    timestamp: '2026-03-04 06:30',
    status: 'aktiv',
  },
  {
    id: '3',
    severity: 'varning',
    title: 'Stigande trend – Siggaboda',
    description:
      'Fångsttrenden har ökat kontinuerligt under 14 dagar. Överstiger varningsgräns.',
    deviceId: 'SK-003',
    area: 'Siggaboda',
    timestamp: '2026-03-03 14:20',
    status: 'aktiv',
  },
  {
    id: '4',
    severity: 'varning',
    title: 'Förhöjd aktivitet – Haraholmen',
    description:
      'Tre sensorer i området rapporterar fångstvärden över 15 skalbaggar/dag.',
    deviceId: 'SK-009',
    area: 'Haraholmen',
    timestamp: '2026-03-03 09:10',
    status: 'aktiv',
  },
  {
    id: '5',
    severity: 'varning',
    title: 'Batterinivå kritiskt låg – Enhet SK-007',
    description:
      'Batterinivån har sjunkit under 15%. Enheten kan sluta rapportera inom 48 timmar.',
    deviceId: 'SK-007',
    area: 'Haraholmen',
    timestamp: '2026-03-03 05:00',
    status: 'aktiv',
  },
  {
    id: '6',
    severity: 'info',
    title: 'Enhet åter online – SK-004',
    description:
      'Enheten förlorade anslutning under 3 timmar men har nu återanslutit till nätverket.',
    deviceId: 'SK-004',
    area: 'Hovmansbygd',
    timestamp: '2026-03-02 18:33',
    status: 'aktiv',
  },
  {
    id: '7',
    severity: 'info',
    title: 'Planerat underhåll – Hovmansbygd',
    description:
      'Schemalagt underhåll av fällor i Hovmansbygd är planerat till 2026-03-10. Kontrollera sensorer inför besök.',
    deviceId: 'SK-001',
    area: 'Hovmansbygd',
    timestamp: '2026-03-01 10:00',
    status: 'aktiv',
  },
  {
    id: '8',
    severity: 'larm',
    title: 'Kritisk fångst – Haraholmen sektor A',
    description:
      'Fångsttopp detekterad och åtgärdad. Inspektionstillfälle genomfört 2026-02-28.',
    deviceId: 'SK-008',
    area: 'Haraholmen',
    timestamp: '2026-02-28 11:15',
    status: 'lost',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function severityBorderClass(severity: Severity): string {
  if (severity === 'larm') return 'border-l-4 border-l-red-500'
  if (severity === 'varning') return 'border-l-4 border-l-amber-500'
  return 'border-l-4 border-l-blue-500'
}

function severityIconCircleClass(severity: Severity): string {
  if (severity === 'larm') return 'bg-red-100'
  if (severity === 'varning') return 'bg-amber-100'
  return 'bg-blue-100'
}

function severityBadgeClass(severity: Severity): string {
  if (severity === 'larm') return 'bg-red-100 text-red-700'
  if (severity === 'varning') return 'bg-amber-100 text-amber-700'
  return 'bg-blue-100 text-blue-700'
}

function severityBadgeLabel(severity: Severity): string {
  if (severity === 'larm') return 'LARM'
  if (severity === 'varning') return 'VARNING'
  return 'INFO'
}

function SeverityIcon({ severity }: { severity: Severity }) {
  if (severity === 'larm') return <AlertOctagon className="w-5 h-5 text-red-500" />
  if (severity === 'varning') return <AlertTriangle className="w-5 h-5 text-amber-500" />
  return <Info className="w-5 h-5 text-blue-500" />
}

// ─── Alert Card ───────────────────────────────────────────────────────────────

interface AlertCardProps {
  alert: Alert
  onMarkResolved: (id: string) => void
}

function AlertCard({ alert, onMarkResolved }: AlertCardProps) {
  const resolved = alert.status === 'lost'

  return (
    <div
      className={`bg-white rounded-xl border border-stone-200 p-5 flex gap-4 ${severityBorderClass(alert.severity)} ${resolved ? 'opacity-60' : ''}`}
    >
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${severityIconCircleClass(alert.severity)}`}
      >
        <SeverityIcon severity={alert.severity} />
      </div>

      {/* Middle content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-800 leading-snug">{alert.title}</p>
        <p className="text-xs text-stone-500 mt-1 leading-relaxed">{alert.description}</p>
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <span className="bg-stone-100 text-stone-600 text-xs px-2 py-0.5 rounded font-mono">
            {alert.deviceId}
          </span>
          <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded">
            {alert.area}
          </span>
        </div>
        {alert.status === 'aktiv' && (
          <button
            onClick={() => onMarkResolved(alert.id)}
            className="mt-3 text-xs text-stone-500 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 hover:text-stone-700 transition-colors flex items-center gap-1.5 ml-auto"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Markera som löst
          </button>
        )}
      </div>

      {/* Right column */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0 text-right">
        <span className="text-xs text-stone-400">{alert.timestamp}</span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${severityBadgeClass(alert.severity)}`}
        >
          {severityBadgeLabel(alert.severity)}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            alert.status === 'aktiv'
              ? 'bg-green-100 text-green-700'
              : 'bg-stone-100 text-stone-500'
          }`}
        >
          {alert.status === 'aktiv' ? 'Aktiv' : 'Löst'}
        </span>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Larm() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [severityFilter, setSeverityFilter] = useState<'alla' | Severity>('alla')
  const [areaFilter, setAreaFilter] = useState<'alla' | Area>('alla')
  const [statusFilter, setStatusFilter] = useState<'aktiva' | 'lost' | 'alla'>('aktiva')

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (severityFilter !== 'alla' && a.severity !== severityFilter) return false
      if (areaFilter !== 'alla' && a.area !== areaFilter) return false
      if (statusFilter === 'aktiva' && a.status !== 'aktiv') return false
      if (statusFilter === 'lost' && a.status !== 'lost') return false
      return true
    })
  }, [alerts, severityFilter, areaFilter, statusFilter])

  const markResolved = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'lost' as AlertStatus } : a))
    )
  }

  const larmCount = alerts.filter((a) => a.severity === 'larm').length
  const varningCount = alerts.filter((a) => a.severity === 'varning').length
  const infoCount = alerts.filter((a) => a.severity === 'info').length

  const severityTabs: Array<{ value: 'alla' | Severity; label: string; activeClass: string }> = [
    { value: 'alla', label: 'Alla', activeClass: 'bg-green-700 text-white' },
    { value: 'larm', label: 'Larm', activeClass: 'bg-red-600 text-white' },
    { value: 'varning', label: 'Varning', activeClass: 'bg-amber-500 text-white' },
    { value: 'info', label: 'Info', activeClass: 'bg-blue-600 text-white' },
  ]

  const statusTabs: Array<{ value: 'aktiva' | 'lost' | 'alla'; label: string }> = [
    { value: 'aktiva', label: 'Aktiva' },
    { value: 'lost', label: 'Lösta' },
    { value: 'alla', label: 'Alla' },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Larm</h2>
        <p className="text-sm text-stone-500 mt-1">
          Övervakningshändelser och systemnotifieringar
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-700">
          {larmCount} Larm
        </span>
        <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
          {varningCount} Varningar
        </span>
        <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
          {infoCount} Info
        </span>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Severity tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {severityTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSeverityFilter(tab.value)}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  severityFilter === tab.value
                    ? tab.activeClass
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Area dropdown */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value as typeof areaFilter)}
            className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-700"
          >
            <option value="alla">Alla områden</option>
            <option value="Hovmansbygd">Hovmansbygd</option>
            <option value="Siggaboda">Siggaboda</option>
            <option value="Haraholmen">Haraholmen</option>
          </select>

          {/* Status toggle */}
          <div className="flex items-center gap-1.5 ml-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-green-700 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-stone-400">
        Visar {filteredAlerts.length} av {alerts.length} larm
      </p>

      {/* Alert list */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-stone-300" />
            <p>Inga larm matchar filtret</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onMarkResolved={markResolved} />
          ))
        )}
      </div>
    </div>
  )
}
