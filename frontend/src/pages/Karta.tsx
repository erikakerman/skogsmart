import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'

type AreaStatus = 'normal' | 'varning' | 'larm'

interface ForestArea {
  id: string
  name: string
  coords: [number, number]
  status: AreaStatus
  fillColor: string
}

interface AreaPanelItem {
  id: string
  name: string
  status: AreaStatus
  sensors: number
  avgSoilHumidity: number
  activeAlerts: number
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const forestAreas: ForestArea[] = [
  { id: 'hovmansbygd', name: 'Hovmansbygd', coords: [56.78, 14.95], status: 'normal',  fillColor: '#4a7c59' },
  { id: 'siggaboda',   name: 'Siggaboda',   coords: [56.62, 15.18], status: 'varning', fillColor: '#e8a020' },
  { id: 'haraholmen',  name: 'Haraholmen',  coords: [56.91, 15.45], status: 'larm',    fillColor: '#c0392b' },
]

const areaPanelItems: AreaPanelItem[] = [
  { id: 'hovmansbygd', name: 'Hovmansbygd', status: 'normal',  sensors: 3, avgSoilHumidity: 62, activeAlerts: 0 },
  { id: 'siggaboda',   name: 'Siggaboda',   status: 'varning', sensors: 4, avgSoilHumidity: 26, activeAlerts: 2 },
  { id: 'haraholmen',  name: 'Haraholmen',  status: 'larm',    sensors: 5, avgSoilHumidity: 67, activeAlerts: 1 },
]

const statusLabelMap: Record<AreaStatus, string> = {
  normal:  'Normal',
  varning: 'Varning',
  larm:    'Larm',
}

// ─── Area panel card ──────────────────────────────────────────────────────────

function AreaCard({ item }: { item: AreaPanelItem }) {
  const soilWarn   = item.avgSoilHumidity < 25
  const alertDanger = item.activeAlerts > 1

  return (
    <div className={`karta-area-card karta-area-card--${item.status}`}>
      <div className="karta-area-header">
        <span className="karta-area-name">{item.name}</span>
        <div className="status-dot-wrap">
          <span className={`status-dot status-dot--${item.status}`} />
          <span className="status-label">{statusLabelMap[item.status]}</span>
        </div>
      </div>
      <div className="karta-area-stats">
        <div>
          <p className="karta-stat__label">Sensorer</p>
          <p className="karta-stat__value">{item.sensors}</p>
        </div>
        <div>
          <p className="karta-stat__label">Jordfuktighet</p>
          <p className={`karta-stat__value${soilWarn ? ' karta-stat__value--warning' : ''}`}>
            {item.avgSoilHumidity}%
          </p>
        </div>
        <div>
          <p className="karta-stat__label">Aktiva larm</p>
          <p className={`karta-stat__value${alertDanger ? ' karta-stat__value--danger' : item.activeAlerts > 0 ? ' karta-stat__value--warning' : ''}`}>
            {item.activeAlerts}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Karta() {
  return (
    <div className="page">
      <div className="karta-layout">

        {/* Left: map */}
        <div className="karta-map-area">
          <div className="map-wrap">
            <MapContainer center={[56.75, 15.2]} zoom={9} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />

              {forestAreas.map((area) => (
                <CircleMarker
                  key={area.id}
                  center={area.coords}
                  radius={18}
                  pathOptions={{
                    color: 'white',
                    fillColor: area.fillColor,
                    fillOpacity: 0.92,
                    weight: 3,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -14]} opacity={1}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '13px' }}>
                      {area.name}
                    </span>
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>

            <div className="map-legend">
              <p className="map-legend__title">Förklaring</p>
              <div className="map-legend__items">
                <div className="status-dot-wrap">
                  <span className="status-dot status-dot--normal" />
                  <span className="status-label">Normal</span>
                </div>
                <div className="status-dot-wrap">
                  <span className="status-dot status-dot--varning" />
                  <span className="status-label">Varning</span>
                </div>
                <div className="status-dot-wrap">
                  <span className="status-dot status-dot--larm" />
                  <span className="status-label">Larm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: summary panel */}
        <div className="karta-panel">
          <div className="page-header">
            <h1 className="page-title">Karta</h1>
            <p className="page-subtitle">Sensorernas placering och status i realtid</p>
          </div>
          {areaPanelItems.map((item) => (
            <AreaCard key={item.id} item={item} />
          ))}
        </div>

      </div>
    </div>
  )
}
