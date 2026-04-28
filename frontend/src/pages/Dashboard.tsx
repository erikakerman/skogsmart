import { Cpu, TreePine, BellDot, Droplets, AlertTriangle, Info } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ─── Data interfaces ──────────────────────────────────────────────────────────

interface ChartDataPoint {
  dag: string
  Hovmansbygd: number
  Siggaboda: number
  Haraholmen: number
}

interface Alert {
  id: number
  title: string
  subtitle: string
  severity: 'VARNING' | 'INFO'
  time: string
}

interface Reading {
  enhet: string
  omrade: string
  jordFuktighet: number
  markTemp: string
  luftTemp: string
  luftfuktighet: string
  batteri: number
  tidpunkt: string
}

// ─── Chart data ───────────────────────────────────────────────────────────────

const SWEDISH_SHORT_MONTHS = [
  'jan', 'feb', 'mars', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
]

function generateChartData(): ChartDataPoint[] {
  const endDate = new Date(2026, 2, 4)
  const data: ChartDataPoint[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(endDate)
    date.setDate(endDate.getDate() - i)
    const label = `${date.getDate()} ${SWEDISH_SHORT_MONTHS[date.getMonth()]}`
    const progress = (29 - i) / 29
    const hovBase = 62 + Math.sin(progress * Math.PI * 2) * 6
    const hov = Math.max(50, Math.min(78, Math.round(hovBase + (Math.random() * 4 - 2))))
    const sigBase = 60 - progress * 42
    const sig = Math.max(15, Math.round(sigBase + (Math.random() * 4 - 2)))
    const haraBase = 70 + Math.sin(progress * Math.PI * 1.5) * 4
    const hara = Math.max(58, Math.min(82, Math.round(haraBase + (Math.random() * 4 - 2))))
    data.push({ dag: label, Hovmansbygd: hov, Siggaboda: sig, Haraholmen: hara })
  }
  return data
}

const chartData: ChartDataPoint[] = generateChartData()

// ─── Static data ──────────────────────────────────────────────────────────────

const alerts: Alert[] = [
  { id: 1, title: 'Låg jordfuktighet – Siggaboda',    subtitle: 'Jordfuktighet under 25%',    severity: 'VARNING', time: '2 timmar sedan' },
  { id: 2, title: 'Batterinivå låg – Enhet SK-007',   subtitle: 'Batterinivå under 20%',      severity: 'INFO',    time: '5 timmar sedan' },
  { id: 3, title: 'Hög lufttemperatur – Haraholmen',  subtitle: 'Lufttemperatur över 35°C',   severity: 'VARNING', time: 'Igår' },
]

const readings: Reading[] = [
  { enhet: 'SK-003', omrade: 'Siggaboda',   jordFuktighet: 21, markTemp: '8.2°C', luftTemp: '16.4°C', luftfuktighet: '78%', batteri: 65, tidpunkt: '2026-03-04 08:12' },
  { enhet: 'SK-007', omrade: 'Haraholmen',  jordFuktighet: 68, markTemp: '7.8°C', luftTemp: '15.8°C', luftfuktighet: '82%', batteri: 18, tidpunkt: '2026-03-04 07:55' },
  { enhet: 'SK-001', omrade: 'Hovmansbygd', jordFuktighet: 62, markTemp: '9.1°C', luftTemp: '17.1°C', luftfuktighet: '71%', batteri: 87, tidpunkt: '2026-03-04 07:40' },
  { enhet: 'SK-011', omrade: 'Siggaboda',   jordFuktighet: 19, markTemp: '8.0°C', luftTemp: '16.0°C', luftfuktighet: '79%', batteri: 41, tidpunkt: '2026-03-04 06:58' },
  { enhet: 'SK-009', omrade: 'Haraholmen',  jordFuktighet: 71, markTemp: '7.6°C', luftTemp: '15.6°C', luftfuktighet: '84%', batteri: 60, tidpunkt: '2026-03-03 23:14' },
]

// ─── KPI card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  trend: string
  icon: React.ComponentType<{ size?: number }>
  variant: 'green' | 'amber' | 'red' | 'blue'
}

function KpiCard({ label, value, trend, icon: Icon, variant }: KpiCardProps) {
  return (
    <div className={`kpi-card kpi-card--${variant}`}>
      <div className={`kpi-card__icon-wrap kpi-card__icon-wrap--${variant}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="kpi-card__label">{label}</p>
        <p className="kpi-card__value">{value}</p>
        <p className="kpi-card__trend">{trend}</p>
      </div>
    </div>
  )
}

// ─── Chart legend ─────────────────────────────────────────────────────────────

const legendItems = [
  { label: 'Hovmansbygd', color: '#4a7c59' },
  { label: 'Siggaboda',   color: '#e8a020' },
  { label: 'Haraholmen',  color: '#2c6ea6' },
]

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const xTickFormatter = (_: string, index: number) => (index % 5 === 0 ? _ : '')

  return (
    <div className="page">
      <div className="kpi-grid">
        <KpiCard label="Aktiva sensorer"     value="12"  trend="= oförändrat"    icon={Cpu}      variant="green" />
        <KpiCard label="Skogsområden"        value="4"   trend="= oförändrat"    icon={TreePine} variant="green" />
        <KpiCard label="Aktiva larm"         value="3"   trend="↑ 1 sedan igår"  icon={BellDot}  variant="red"   />
        <KpiCard label="Snitt jordfuktighet" value="58%" trend="↓ 3% sedan igår" icon={Droplets} variant="blue"  />
      </div>

      {/* Gradient area chart with floating legend */}
      <div className="chart-card">
        <p className="card-title">Jordfuktighet per område — senaste 30 dagarna</p>

        <div className="chart-legend-float">
          {legendItems.map(({ label, color }) => (
            <div key={label} className="chart-legend-float__item">
              <span className="chart-legend-float__line" style={{ background: color }} />
              <span className="chart-legend-float__label">{label}</span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={290}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 4 }}>
            <defs>
              <linearGradient id="gradHov" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4a7c59" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#4a7c59" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradSig" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#e8a020" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#e8a020" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradHara" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2c6ea6" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#2c6ea6" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e4da" vertical={false} />
            <XAxis
              dataKey="dag"
              tick={{ fontSize: 11, fill: '#8a9a8a', fontFamily: 'DM Sans' }}
              tickFormatter={xTickFormatter}
              interval={0}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#8a9a8a', fontFamily: 'DM Sans' }}
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid #e4e0d6',
                background: '#ffffff',
                boxShadow: '0 6px 24px rgba(26,46,26,0.10)',
                fontSize: '12px',
                fontFamily: "'DM Sans', sans-serif",
                padding: '10px 14px',
              }}
              labelStyle={{ fontWeight: 600, color: '#1c2b1c', marginBottom: '4px' }}
              formatter={(value: number | undefined) => [
                value !== undefined ? `${value}%` : '–',
                undefined,
              ]}
            />
            <Area type="monotone" dataKey="Hovmansbygd" stroke="#4a7c59" strokeWidth={2} fill="url(#gradHov)"  dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            <Area type="monotone" dataKey="Siggaboda"   stroke="#e8a020" strokeWidth={2} fill="url(#gradSig)"  dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            <Area type="monotone" dataKey="Haraholmen"  stroke="#2c6ea6" strokeWidth={2} fill="url(#gradHara)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="two-col">
        {/* Active alerts */}
        <div className="card">
          <p className="card-title">Aktiva larm</p>
          <div className="dash-alert-list">
            {alerts.map((alert) => {
              const isWarning = alert.severity === 'VARNING'
              return (
                <div key={alert.id} className={`dash-alert-item dash-alert-item--${isWarning ? 'varning' : 'info'}`}>
                  <div className="dash-alert-item__icon">
                    {isWarning
                      ? <AlertTriangle size={15} color="var(--red)" />
                      : <Info size={15} color="var(--blue)" />
                    }
                  </div>
                  <div className="dash-alert-item__content">
                    <p className="dash-alert-item__title">{alert.title}</p>
                    <p className="dash-alert-item__sub">{alert.subtitle}</p>
                  </div>
                  <div className="dash-alert-item__right">
                    <span className={`severity-pill severity-pill--${isWarning ? 'varning' : 'info'}`}>
                      {alert.severity}
                    </span>
                    <span className="dash-alert-item__time">{alert.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent readings */}
        <div className="card">
          <p className="card-title">Senaste avläsningar</p>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Enhet</th>
                  <th>Område</th>
                  <th className="text-right">Jordfukt.</th>
                  <th className="text-right">Marktemp</th>
                  <th className="text-right">Lufttemp</th>
                  <th className="text-right">Batteri</th>
                  <th>Tidpunkt</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((row) => (
                  <tr key={`${row.enhet}-${row.tidpunkt}`}>
                    <td className="col-mono">{row.enhet}</td>
                    <td>{row.omrade}</td>
                    <td className={`text-right${row.jordFuktighet < 25 ? ' col-warn' : ''}`}>
                      {row.jordFuktighet}%
                    </td>
                    <td className="text-right">{row.markTemp}</td>
                    <td className="text-right">{row.luftTemp}</td>
                    <td className={`text-right${row.batteri < 20 ? ' col-danger' : ''}`}>
                      {row.batteri}%
                    </td>
                    <td className="col-muted">{row.tidpunkt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
