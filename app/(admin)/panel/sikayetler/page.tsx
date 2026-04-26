'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ComplaintTable from '@/components/admin/ComplaintTable'
import type { Complaint, ComplaintStatus, ComplaintCategory } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, RefreshCw } from 'lucide-react'

const STATUSES: { value: ComplaintStatus; label: string }[] = [
  { value: 'beklemede', label: '⏳ Beklemede' },
  { value: 'inceleniyor', label: '🔍 İnceleniyor' },
  { value: 'islemde', label: '🔧 İşlemde' },
  { value: 'cozuldu', label: '✅ Çözüldü' },
  { value: 'reddedildi', label: '❌ Reddedildi' },
]

const CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: 'cukur', label: '🕳️ Çukur' },
  { value: 'aydinlatma', label: '💡 Aydınlatma' },
  { value: 'temizlik', label: '🗑️ Temizlik' },
  { value: 'trafik_isareti', label: '🚦 Trafik' },
  { value: 'kaldırim', label: '🚶 Kaldırım' },
  { value: 'park_bahce', label: '🌳 Park' },
  { value: 'su_kanal', label: '💧 Su/Kanal' },
  { value: 'diger', label: '📋 Diğer' },
]

export default function AdminComplaintsPage() {
  const supabase = createClient()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const fetchComplaints = async () => {
    setLoading(true)
    let query = supabase
      .from('complaints')
      .select('*, profiles!complaints_user_id_fkey(full_name)')
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }
    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter)
    }

    const { data } = await query.limit(100)
    setComplaints(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchComplaints()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 Tüm Şikayetler</h1>
          <p className="text-gray-500 text-sm mt-1">{complaints.length} şikayet listeleniyor</p>
        </div>
        <Button onClick={fetchComplaints} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Yenile
        </Button>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          Filtreler
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]" id="filter-status">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              {STATUSES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]" id="filter-category">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : (
        <ComplaintTable complaints={complaints} />
      )}
    </div>
  )
}
