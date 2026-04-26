'use client'

import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { Complaint } from '@/types'
import StatusBadge from '@/components/complaint/StatusBadge'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, MapPin } from 'lucide-react'

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
}

export default function ComplaintTable({ complaints }: Props) {
  if (!complaints || complaints.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Henüz şikayet bulunmuyor</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Başlık</TableHead>
            <TableHead className="font-semibold">Kategori</TableHead>
            <TableHead className="font-semibold">İlçe</TableHead>
            <TableHead className="font-semibold">Durum</TableHead>
            <TableHead className="font-semibold">Tarih</TableHead>
            <TableHead className="font-semibold text-right">İşlem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map(complaint => (
            <TableRow key={complaint.id} className="hover:bg-gray-50 transition-colors">
              <TableCell>
                <div>
                  <p className="font-medium text-gray-800 truncate max-w-[200px]">
                    {complaint.title}
                  </p>
                  {complaint.profiles?.full_name && (
                    <p className="text-xs text-gray-400">
                      {complaint.profiles.full_name}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{CATEGORY_LABELS[complaint.category]}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {complaint.district || '—'}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={complaint.status} />
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(complaint.created_at), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/sikayet/${complaint.id}`}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Detay
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
