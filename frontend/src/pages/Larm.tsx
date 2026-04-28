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

// ─── Data ─────────────────────────────────────────────────────────────────────

const initialAlerts: Alert[] = [
  {
    id: '1', severity: 'larm', title: 'Kritisk torka – Siggaboda',
    description: 'Jordfuktigheten har sjunkit under 25% på tre sensorer i området. Risk för skogsstress. Omedelbar bedömning rekommenderas.',
    deviceId: 'SK-006', area: 'Siggaboda', timestamp: '2026-03-04 08:45', status: 'aktiv',
  },
  {
    id: '2', severity: 'larm', title: 'Extrem lufttemperatur – Haraholmen',
    description: 'Lufttemperaturen har överstigit 35°C. Extremt värme ökar risken för skogsstress och brandbenägenhet.',
    deviceId: 'SK-009', area: 'Haraholmen', timestamp: '2026-03-04 06:30', status: 'aktiv',
  },
  {
    id: '3', severity: 'varning', title: 'Sjunkande jordfuktighet – Siggaboda',
    description: 'Jordfuktigheten har minskat kontinuerligt under 14 dagar och närmar sig varningsgränsen på 25%.',
    deviceId: 'SK-005', area: 'Siggaboda', timestamp: '2026-03-03 14:20', status: 'aktiv',
  },
  {
    id: '4', severity: 'varning', title: 'Förhöjd lufttemperatur – Siggaboda',
    description: 'Lufttemperaturen har legat över 30°C under 48 timmar. Tre sensorer i området bekräftar trenden.',
    deviceId: 'SK-004', area: 'Siggaboda', timestamp: '2026-03-03 09:10', status: 'aktiv',
  },
  {
    id: '5', severity: 'varning', title: 'Batterinivå kritiskt låg – Enhet SK-007',
    description: 'Batterinivån har sjunkit under 20%. Enheten kan sluta rapportera inom 48 timmar.',
    deviceId: 'SK-007', area: 'Siggaboda', timestamp: '2026-03-03 05:00', status: 'aktiv',
  },
  {
    id: '6', severity: 'info', title: 'Enhet åter online – SK-004',
    description: 'Enheten förlorade anslutning under 3 timmar men har nu återanslutit till nätverket.',
    deviceId: 'SK-004', area: 'Hovmansbygd', timestamp: '2026-03-02 18:33', status: 'aktiv',
  },
  {
    id: '7', severity: 'info', title: 'Planerat underhåll – Hovmansbygd',
    description: 'Schemalagt underhåll av sensorer i Hovmansbygd är planerat till 2026-03-10. Kontrollera enheterna inför besök.',
    deviceId: 'SK-001', area: 'Hovmansbygd', timestamp: '2026-03-01 10:00', status: 'aktiv',
  },
  {
    id: '8', severity: 'larm', title: 'Kritisk torka – Haraholmen sektor A',
    description: 'Jordfuktigheten understeg 25% under fyra dagar. Åtgärd vidtagen och bevattning genomförd 2026-02-28.',
    deviceId: 'SK-008', area: 'Haraholmen', timestamp: '2026-02-28 11:15', status: 'lost',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SeverityIcon({ severity }: { severity: Severity }) {
  if (severity === 'larm')    return <AlertOctagon size={17} />
  if (severity === 'varning') return <AlertTriangle size={17} />
  return <Info size={17} />
}

// ─── Alert card ───────────────────────────────────────────────────────────────

interface AlertCardProps {
  alert: Alert
  onMarkResolved: (id: string) => void
}

function AlertCard({ alert, onMarkResolved }: AlertCardProps) {
  const resolved = alert.status === 'lost'
  return (
    <div className={`alert-card alert-card--${alert.severity}${resolved ? ' alert-card--resolved' : ''}`}>
      <div className={`alert-card__icon-wrap alert-card__icon-wrap--${alert.severity}`}>
        <SeverityIcon severity={alert.severity} />
      </div>

      <div className="alert-card__body">
        <p className="alert-card__title">{alert.title}</p>
        <p className="alert-card__desc">{alert.description}</p>
        <div className="alert-card__tags">
          <span className="tag tag--mono">{alert.deviceId}</span>
          <span className="tag tag--area">{alert.area}</span>
        </div>
        {!resolved && (
          <button onClick={() => onMarkResolved(alert.id)} className="resolve-btn">
            <CheckCircle size={13} />
            Markera som löst
          </button>
        )}
      </div>

      <div className="alert-card__meta">
        <span className="alert-card__time">{alert.timestamp}</span>
        <span className={`severity-pill severity-pill--${alert.severity}`}>
          {alert.severity.toUpperCase()}
        </span>
        <span className={`status-pill status-pill--${alert.status}`}>
          {alert.status === 'aktiv' ? 'Aktiv' : 'Löst'}
        </span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SevFilter = 'alla' | Severity
type StatusFilter = 'aktiva' | 'lost' | 'alla'

export default function Larm() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [severityFilter, setSeverityFilter] = useState<SevFilter>('alla')
  const [areaFilter, setAreaFilter] = useState<'alla' | Area>('alla')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('aktiva')

  const filteredAlerts = useMemo(() => alerts.filter((a) => {
    if (severityFilter !== 'alla' && a.severity !== severityFilter) return false
    if (areaFilter     !== 'alla' && a.area     !== areaFilter)     return false
    if (statusFilter === 'aktiva' && a.status !== 'aktiv') return false
    if (statusFilter === 'lost'   && a.status !== 'lost')  return false
    return true
  }), [alerts, severityFilter, areaFilter, statusFilter])

  const markResolved = (id: string) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'lost' as AlertStatus } : a)))

  const larmCount    = alerts.filter((a) => a.severity === 'larm').length
  const varningCount = alerts.filter((a) => a.severity === 'varning').length
  const infoCount    = alerts.filter((a) => a.severity === 'info').length

  const sevTabActiveClass = (val: SevFilter): string => {
    if (severityFilter !== val) return 'filter-tab'
    const map: Record<SevFilter, string> = {
      alla:    'filter-tab filter-tab--active-default',
      larm:    'filter-tab filter-tab--active-larm',
      varning: 'filter-tab filter-tab--active-varning',
      info:    'filter-tab filter-tab--active-info',
    }
    return map[val]
  }

  return (
    <div className="page">
      <div className="pill-row">
        <span className="pill pill--red">{larmCount} Larm</span>
        <span className="pill pill--amber">{varningCount} Varningar</span>
        <span className="pill pill--blue">{infoCount} Info</span>
      </div>

      <div className="filter-bar">
        <div className="filter-tabs">
          {(['alla', 'larm', 'varning', 'info'] as SevFilter[]).map((val) => (
            <button key={val} onClick={() => setSeverityFilter(val)} className={sevTabActiveClass(val)}>
              {val === 'alla' ? 'Alla' : val.charAt(0).toUpperCase() + val.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value as typeof areaFilter)}
          className="select"
        >
          <option value="alla">Alla områden</option>
          <option value="Hovmansbygd">Hovmansbygd</option>
          <option value="Siggaboda">Siggaboda</option>
          <option value="Haraholmen">Haraholmen</option>
        </select>

        <div className="filter-tabs" style={{ marginLeft: 'auto' }}>
          {(['aktiva', 'lost', 'alla'] as StatusFilter[]).map((val) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`filter-tab${statusFilter === val ? ' filter-tab--active-default' : ''}`}
            >
              {val === 'aktiva' ? 'Aktiva' : val === 'lost' ? 'Lösta' : 'Alla'}
            </button>
          ))}
        </div>
      </div>

      <p className="result-count">Visar {filteredAlerts.length} av {alerts.length} larm</p>

      <div className="alert-list">
        {filteredAlerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><CheckCircle size={40} /></div>
            <p className="empty-state__text">Inga larm matchar filtret</p>
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
