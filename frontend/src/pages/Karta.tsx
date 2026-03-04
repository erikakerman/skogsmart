import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'

type AreaStatus = 'normal' | 'varning' | 'larm'
type SensorStatus = 'normal' | 'varning' | 'larm'

interface ForestArea {
  id: string
  name: string
  coords: [number, number]
  status: AreaStatus
  activeSensors: number
  latestCatch: number
  color: string
  fillColor: string
}

interface SensorNode {
  id: string
  area: string
  coords: [number, number]
  status: SensorStatus
  deviceId: string
  latestCatch: number
}

const forestAreas: ForestArea[] = [
  {
    id: 'hovmansbygd',
    name: 'Hovmansbygd',
    coords: [56.78, 14.95],
    status: 'normal',
    activeSensors: 3,
    latestCatch: 3,
    color: '#16a34a',
    fillColor: '#16a34a',
  },
  {
    id: 'siggaboda',
    name: 'Siggaboda',
    coords: [56.62, 15.18],
    status: 'varning',
    activeSensors: 4,
    latestCatch: 34,
    color: '#d97706',
    fillColor: '#d97706',
  },
  {
    id: 'haraholmen',
    name: 'Haraholmen',
    coords: [56.91, 15.45],
    status: 'larm',
    activeSensors: 5,
    latestCatch: 45,
    color: '#dc2626',
    fillColor: '#dc2626',
  },
]

const sensorNodes: SensorNode[] = [
  // Hovmansbygd — 3 sensors, all green
  { id: 's1', area: 'Hovmansbygd', coords: [56.792, 14.932], status: 'normal', deviceId: 'SK-001', latestCatch: 2 },
  { id: 's2', area: 'Hovmansbygd', coords: [56.771, 14.968], status: 'normal', deviceId: 'SK-002', latestCatch: 3 },
  { id: 's3', area: 'Hovmansbygd', coords: [56.784, 14.913], status: 'normal', deviceId: 'SK-004', latestCatch: 1 },

  // Siggaboda — 4 sensors: 2 amber, 1 green, 1 red
  { id: 's4', area: 'Siggaboda', coords: [56.608, 15.161], status: 'varning', deviceId: 'SK-003', latestCatch: 29 },
  { id: 's5', area: 'Siggaboda', coords: [56.631, 15.197], status: 'varning', deviceId: 'SK-005', latestCatch: 22 },
  { id: 's6', area: 'Siggaboda', coords: [56.614, 15.212], status: 'normal',  deviceId: 'SK-006', latestCatch: 8 },
  { id: 's7', area: 'Siggaboda', coords: [56.625, 15.148], status: 'larm',    deviceId: 'SK-011', latestCatch: 41 },

  // Haraholmen — 5 sensors: 3 red, 2 amber
  { id: 's8',  area: 'Haraholmen', coords: [56.923, 15.428], status: 'larm',    deviceId: 'SK-007', latestCatch: 45 },
  { id: 's9',  area: 'Haraholmen', coords: [56.905, 15.462], status: 'larm',    deviceId: 'SK-008', latestCatch: 38 },
  { id: 's10', area: 'Haraholmen', coords: [56.918, 15.471], status: 'larm',    deviceId: 'SK-009', latestCatch: 33 },
  { id: 's11', area: 'Haraholmen', coords: [56.897, 15.437], status: 'varning', deviceId: 'SK-010', latestCatch: 19 },
  { id: 's12', area: 'Haraholmen', coords: [56.932, 15.445], status: 'varning', deviceId: 'SK-012', latestCatch: 14 },
]

const statusColorMap: Record<SensorStatus, string> = {
  normal: '#16a34a',
  varning: '#d97706',
  larm: '#dc2626',
}

const statusLabelMap: Record<AreaStatus | SensorStatus, string> = {
  normal: 'Normal',
  varning: 'Varning ⚠️',
  larm: 'Larm 🔴',
}

export default function Karta() {
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-stone-800">Karta</h2>
        <p className="text-sm text-stone-500 mt-0.5">Sensorernas placering och status i realtid</p>
      </div>

      {/* Map fills remaining height */}
      <div className="relative flex-1 rounded-xl overflow-hidden border border-stone-200 shadow-sm min-h-[500px]">
        <MapContainer
          center={[56.7, 15.2]}
          zoom={9}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />

          {/* Forest area markers — large circles */}
          {forestAreas.map((area) => (
            <CircleMarker
              key={area.id}
              center={area.coords}
              radius={18}
              pathOptions={{
                color: area.color,
                fillColor: area.fillColor,
                fillOpacity: 0.35,
                weight: 3,
              }}
            >
              <Popup>
                <div style={{ lineHeight: '1.6', minWidth: '160px' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px' }}>{area.name}</p>
                  <p style={{ margin: '0 0 2px' }}>Aktiva sensorer: {area.activeSensors}</p>
                  <p style={{ margin: '0 0 2px' }}>Senaste fångst: {area.latestCatch} skalbaggar</p>
                  <p style={{ margin: '0' }}>Status: {statusLabelMap[area.status]}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Sensor node markers — small circles */}
          {sensorNodes.map((node) => {
            const color = statusColorMap[node.status]
            return (
              <CircleMarker
                key={node.id}
                center={node.coords}
                radius={8}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.85,
                  weight: 2,
                }}
              >
                <Popup>
                  <div style={{ lineHeight: '1.6', minWidth: '160px' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px' }}>{node.deviceId}</p>
                    <p style={{ margin: '0 0 2px' }}>Område: {node.area}</p>
                    <p style={{ margin: '0 0 2px' }}>Fångst: {node.latestCatch} skalbaggar</p>
                    <p style={{ margin: '0' }}>Status: {statusLabelMap[node.status]}</p>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>

        {/* Legend overlay */}
        <div className="absolute bottom-6 right-4 z-[1000] bg-white rounded-xl shadow-lg p-3 text-sm text-stone-700">
          <p className="font-semibold mb-1.5">Förklaring</p>
          <div className="flex flex-col gap-1">
            <span>🟢 Normal</span>
            <span>🟡 Varning</span>
            <span>🔴 Larm</span>
          </div>
        </div>
      </div>
    </div>
  )
}
