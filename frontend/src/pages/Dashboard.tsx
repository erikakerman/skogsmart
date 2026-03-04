import { Cpu, TreePine, BellDot, Bug, AlertTriangle, Info } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  fangst: number
  temp: string
  luftfuktighet: string
  tidpunkt: string
}

// ─── Chart data generation ────────────────────────────────────────────────────

const SWEDISH_SHORT_MONTHS = [
  'jan', 'feb', 'mars', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
]

function generateChartData(): ChartDataPoint[] {
  // End date: 2026-03-04 (today). Generate 30 days ending on this date.
  const endDate = new Date(2026, 2, 4) // month is 0-indexed, so 2 = March
  const data: ChartDataPoint[] = []

  for (let i = 29; i >= 0; i--) {
    const date = new Date(endDate)
    date.setDate(endDate.getDate() - i)

    const day = date.getDate()
    const month = SWEDISH_SHORT_MONTHS[date.getMonth()]
    const label = `${day} ${month}`

    const progress = (29 - i) / 29 // 0 at start, 1 at end

    // Hovmansbygd: calm, 2–8 per day with slight noise
    const hovBase = 4 + Math.sin(progress * Math.PI * 3) * 1.5
    const hov = Math.max(2, Math.round(hovBase + (Math.random() * 3 - 1.5)))

    // Siggaboda: rises from ~5 to ~35 over the period
    const sigBase = 5 + progress * 30
    const sig = Math.max(2, Math.round(sigBase + (Math.random() * 5 - 2.5)))

    // Haraholmen: spike around day 18–20 (progress ~0.59–0.66), then drops back
    const dayIndex = 29 - i
    const spikeCenter = 19
    const spikeWidth = 3
    const spikeHeight = 45
    const spikeDist = Math.abs(dayIndex - spikeCenter)
    const spikeFactor = Math.max(0, 1 - spikeDist / spikeWidth)
    const haraBase = 8 + spikeFactor * (spikeHeight - 8)
    const hara = Math.max(2, Math.round(haraBase + (Math.random() * 4 - 2)))

    data.push({
      dag: label,
      Hovmansbygd: hov,
      Siggaboda: sig,
      Haraholmen: hara,
    })
  }

  return data
}

const chartData: ChartDataPoint[] = generateChartData()

// ─── Static data ──────────────────────────────────────────────────────────────

const alerts: Alert[] = [
  {
    id: 1,
    title: 'Hög fångst – Siggaboda område',
    subtitle: 'Fångstgräns överskriden',
    severity: 'VARNING',
    time: '2 timmar sedan',
  },
  {
    id: 2,
    title: 'Batterinivå låg – Enhet SK-007',
    subtitle: 'Batterinivå under 15%',
    severity: 'INFO',
    time: '5 timmar sedan',
  },
  {
    id: 3,
    title: 'Hög fångst – Haraholmen sektor B',
    subtitle: 'Fångstgräns överskriden',
    severity: 'VARNING',
    time: 'Igår',
  },
]

const readings: Reading[] = [
  {
    enhet: 'SK-003',
    omrade: 'Siggaboda',
    fangst: 34,
    temp: '4.2°C',
    luftfuktighet: '78%',
    tidpunkt: '2026-03-04 08:12',
  },
  {
    enhet: 'SK-007',
    omrade: 'Haraholmen',
    fangst: 8,
    temp: '3.8°C',
    luftfuktighet: '82%',
    tidpunkt: '2026-03-04 07:55',
  },
  {
    enhet: 'SK-001',
    omrade: 'Hovmansbygd',
    fangst: 3,
    temp: '5.1°C',
    luftfuktighet: '71%',
    tidpunkt: '2026-03-04 07:40',
  },
  {
    enhet: 'SK-011',
    omrade: 'Siggaboda',
    fangst: 29,
    temp: '4.0°C',
    luftfuktighet: '79%',
    tidpunkt: '2026-03-04 06:58',
  },
  {
    enhet: 'SK-009',
    omrade: 'Haraholmen',
    fangst: 5,
    temp: '3.6°C',
    luftfuktighet: '84%',
    tidpunkt: '2026-03-03 23:14',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}

function KpiCard({ label, value, icon: Icon, iconBg, iconColor }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide leading-none">
          {label}
        </p>
        <p className="text-3xl font-bold text-stone-900 mt-1 leading-none">{value}</p>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  // Show every 5th X-axis tick to avoid crowding
  const xAxisTickFormatter = (value: string, index: number) => {
    return index % 5 === 0 ? value : ''
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Översikt</h1>
        <p className="text-sm text-stone-500 mt-1">
          Realtidsövervakning av granbarkborre
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Aktiva sensorer"
          value="12"
          icon={Cpu}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <KpiCard
          label="Skogsområden"
          value="4"
          icon={TreePine}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <KpiCard
          label="Aktiva larm"
          value="3"
          icon={BellDot}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        <KpiCard
          label="Skalbaggar denna vecka"
          value="847"
          icon={Bug}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="text-sm font-semibold text-stone-700 mb-5">
          Fångster per område (senaste 30 dagarna)
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis
              dataKey="dag"
              tick={{ fontSize: 11, fill: '#78716c' }}
              tickFormatter={xAxisTickFormatter}
              interval={0}
            />
            <YAxis
              label={{
                value: 'Antal',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fontSize: 11, fill: '#78716c' },
              }}
              tick={{ fontSize: 11, fill: '#78716c' }}
              width={45}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e7e5e4',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              formatter={(value: number | undefined) => [value !== undefined ? `${value} st` : '–', undefined]}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            />
            <Line
              type="monotone"
              dataKey="Hovmansbygd"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Siggaboda"
              stroke="#d97706"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Haraholmen"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts + Readings side by side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Active Alerts */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">Aktiva larm</h2>
          <div className="space-y-3">
            {alerts.map((alert) => {
              const isWarning = alert.severity === 'VARNING'
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-l-4 bg-stone-50 ${
                    isWarning
                      ? 'border-l-red-500'
                      : 'border-l-blue-500'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 leading-snug">
                      {alert.title}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">{alert.subtitle}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isWarning
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs text-stone-400">{alert.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Readings Table */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 overflow-x-auto">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">Senaste avläsningar</h2>
          <table className="table-auto w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-500 uppercase text-xs tracking-wide">
                <th className="px-3 py-2.5 text-left font-medium">Enhet</th>
                <th className="px-3 py-2.5 text-left font-medium">Område</th>
                <th className="px-3 py-2.5 text-right font-medium">Fångst</th>
                <th className="px-3 py-2.5 text-right font-medium">Temp</th>
                <th className="px-3 py-2.5 text-right font-medium">Luftfukt.</th>
                <th className="px-3 py-2.5 text-left font-medium">Tidpunkt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {readings.map((row) => (
                <tr
                  key={`${row.enhet}-${row.tidpunkt}`}
                  className="hover:bg-stone-50 transition-colors"
                >
                  <td className="px-3 py-2.5 font-mono text-stone-700 font-medium">
                    {row.enhet}
                  </td>
                  <td className="px-3 py-2.5 text-stone-600">{row.omrade}</td>
                  <td
                    className={`px-3 py-2.5 text-right ${
                      row.fangst >= 20
                        ? 'text-amber-600 font-semibold'
                        : 'text-stone-700'
                    }`}
                  >
                    {row.fangst}
                  </td>
                  <td className="px-3 py-2.5 text-right text-stone-600">{row.temp}</td>
                  <td className="px-3 py-2.5 text-right text-stone-600">
                    {row.luftfuktighet}
                  </td>
                  <td className="px-3 py-2.5 text-stone-500 text-xs">{row.tidpunkt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
