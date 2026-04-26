'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Complaint } from '@/types'
import Link from 'next/link'
import StatusBadge from '@/components/complaint/StatusBadge'

// Leaflet default ikon fix
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

// Durum bazlı renkli ikonlar
const createStatusIcon = (status: string) => {
  const colors: Record<string, string> = {
    beklemede: '#EAB308',
    inceleniyor: '#3B82F6',
    islemde: '#F97316',
    cozuldu: '#22C55E',
    reddedildi: '#EF4444',
  }
  const color = colors[status] || '#6B7280'
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

const CATEGORY_LABELS: Record<string, string> = {
  cukur: '🕳️ Çukur',
  aydinlatma: '💡 Aydınlatma',
  temizlik: '🗑️ Temizlik',
  trafik_isareti: '🚦 Trafik',
  kaldırim: '🚶 Kaldırım',
  park_bahce: '🌳 Park',
  su_kanal: '💧 Su/Kanal',
  diger: '📋 Diğer',
}

interface Props {
  complaints: Complaint[]
  center?: [number, number]
  zoom?: number
  height?: string
}

export default function ComplaintMap({
  complaints,
  center = [36.8841, 30.7056],
  zoom = 13,
  height = '500px',
}: Props) {
  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints.map(complaint => (
          <Marker
            key={complaint.id}
            position={[complaint.latitude, complaint.longitude]}
            icon={createStatusIcon(complaint.status)}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <p className="text-xs text-gray-400 mb-1">
                  {CATEGORY_LABELS[complaint.category]}
                </p>
                <p className="font-semibold text-sm mb-2">{complaint.title}</p>
                <StatusBadge status={complaint.status} />
                <Link
                  href={`/sikayet/${complaint.id}`}
                  className="block mt-2 text-xs text-blue-600 hover:underline font-medium"
                >
                  Detayları gör →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
