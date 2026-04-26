'use client'

import dynamic from 'next/dynamic'
import type { Complaint } from '@/types'

const ComplaintMap = dynamic(
  () => import('@/components/map/ComplaintMap'),
  {
    ssr: false,
    loading: () => <div className="h-[300px] bg-gray-100 animate-pulse rounded-xl" />,
  }
)

interface Props {
  complaint: Complaint
}

export default function DetailMapWrapper({ complaint }: Props) {
  return (
    <ComplaintMap
      complaints={[complaint]}
      center={[complaint.latitude, complaint.longitude]}
      zoom={16}
      height="300px"
    />
  )
}
