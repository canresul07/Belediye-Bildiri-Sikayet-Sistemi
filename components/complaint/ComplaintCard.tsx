import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { Complaint } from '@/types'
import StatusBadge from './StatusBadge'
import Link from 'next/link'
import { MapPin, ThumbsUp, Eye } from 'lucide-react'

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
  complaint: Complaint
}

export default function ComplaintCard({ complaint }: Props) {
  return (
    <Link href={`/sikayet/${complaint.id}`}>
      <div className="group bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 p-4 cursor-pointer overflow-hidden">
        {complaint.photo_urls?.[0] && (
          <div className="relative overflow-hidden rounded-lg mb-3">
            <img
              src={complaint.photo_urls[0]}
              alt={complaint.title}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 right-2">
              <StatusBadge status={complaint.status} />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-500 font-medium">
                {CATEGORY_LABELS[complaint.category]}
              </span>
              <h3 className="font-semibold text-gray-800 mt-0.5 truncate group-hover:text-blue-700 transition-colors">
                {complaint.title}
              </h3>
            </div>
            {!complaint.photo_urls?.[0] && (
              <StatusBadge status={complaint.status} />
            )}
          </div>

          {complaint.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{complaint.description}</p>
          )}

          <div className="flex items-center gap-3 pt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {complaint.district || 'Konum belirtilmedi'}
            </span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(complaint.created_at), {
                addSuffix: true,
                locale: tr,
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              {complaint.upvote_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
