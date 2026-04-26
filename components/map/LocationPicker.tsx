'use client'

import { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Leaflet default ikon fix
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

interface Props {
  onLocationSelect: (lat: number, lng: number) => void
}

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null)

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setPosition([lat, lng])
      onSelect(lat, lng)
    }
  })

  return position ? (
    <Marker position={position} />
  ) : null
}

export default function LocationPicker({ onLocationSelect }: Props) {
  const [selected, setSelected] = useState(false)

  const handleSelect = useCallback((lat: number, lng: number) => {
    onLocationSelect(lat, lng)
    setSelected(true)
  }, [onLocationSelect])

  return (
    <div>
      <div className="h-[300px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <MapContainer
          center={[36.8841, 30.7056]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />
          <ClickHandler onSelect={handleSelect} />
        </MapContainer>
      </div>
      {selected
        ? <p className="text-sm text-green-600 mt-2 font-medium">✅ Konum seçildi</p>
        : <p className="text-sm text-gray-400 mt-2">📍 Haritada sorunun konumuna tıklayın</p>
      }
    </div>
  )
}
