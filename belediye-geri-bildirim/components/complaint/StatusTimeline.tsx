import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { StatusHistory } from '@/types'

const STATUS_ICONS: Record<string, string> = {
  beklemede: '⏳',
  inceleniyor: '🔍',
  islemde: '🔧',
  cozuldu: '✅',
  reddedildi: '❌',
}

const STATUS_LABELS: Record<string, string> = {
  beklemede: 'Beklemede',
  inceleniyor: 'İnceleniyor',
  islemde: 'İşlemde',
  cozuldu: 'Çözüldü',
  reddedildi: 'Reddedildi',
}

interface Props {
  history: StatusHistory[]
}

export default function StatusTimeline({ history }: Props) {
  if (!history || history.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic">
        Henüz durum güncellemesi yok.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700 flex items-center gap-2">
        📅 Durum Geçmişi
      </h3>
      <div className="relative pl-6 border-l-2 border-gray-200 space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="relative">
            <div className="absolute -left-[25px] w-5 h-5 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-xs">
              {STATUS_ICONS[entry.new_status] || '•'}
            </div>
            <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">
                  {STATUS_LABELS[entry.new_status] || entry.new_status}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(entry.created_at), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </span>
              </div>
              {entry.note && (
                <p className="text-sm text-gray-600 mt-1 bg-white p-2 rounded border border-gray-100">
                  💬 {entry.note}
                </p>
              )}
              {entry.profiles?.full_name && (
                <p className="text-xs text-gray-400 mt-1">
                  — {entry.profiles.full_name}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
