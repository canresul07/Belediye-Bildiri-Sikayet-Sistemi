import { Badge } from '@/components/ui/badge'
import type { ComplaintStatus } from '@/types'

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string }> = {
  beklemede:   { label: '⏳ Beklemede',  color: 'border-yellow-400 text-yellow-700 bg-yellow-50' },
  inceleniyor: { label: '🔍 İnceleniyor', color: 'border-blue-400 text-blue-700 bg-blue-50' },
  islemde:     { label: '🔧 İşlemde',    color: 'border-orange-400 text-orange-700 bg-orange-50' },
  cozuldu:     { label: '✅ Çözüldü',    color: 'border-green-400 text-green-700 bg-green-50' },
  reddedildi:  { label: '❌ Reddedildi', color: 'border-red-400 text-red-700 bg-red-50' },
}

export default function StatusBadge({ status }: { status: ComplaintStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap ${config.color}`}>
      {config.label}
    </span>
  )
}
