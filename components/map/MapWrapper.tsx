'use client'

import dynamic from 'next/dynamic'
import type { Complaint } from '@/types'
import { MapPin } from 'lucide-react'

const ComplaintMap = dynamic(
  () => import('@/components/map/ComplaintMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] bg-gradient-to-br from-blue-50 to-green-50 animate-pulse rounded-xl flex items-center justify-center">
        <div className="text-center text-gray-400">
          <MapPin className="w-8 h-8 mx-auto mb-2 animate-bounce" />
          <p>Harita yükleniyor...</p>
        </div>
      </div>
    ),
  }
)

interface Props {
  complaints: Complaint[]
}

export default function MapWrapper({ complaints }: Props) {
  return <ComplaintMap complaints={complaints} />
}
