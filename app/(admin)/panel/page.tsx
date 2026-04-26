'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import StatsCard from '@/components/admin/StatsCard'
import ComplaintTable from '@/components/admin/ComplaintTable'
import type { Complaint } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboard() {
  const supabase = createClient()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('complaints')
        .select('*, profiles!complaints_user_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(50)

      setComplaints(data || [])
      setLoading(false)
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const total = complaints.length
  const beklemede = complaints.filter(c => c.status === 'beklemede').length
  const islemde = complaints.filter(c => c.status === 'islemde').length
  const cozuldu = complaints.filter(c => c.status === 'cozuldu').length

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">📊 Belediye Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Genel şikayet istatistikleri ve son bildirimler</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Toplam Şikayet" value={total} icon="📋" color="blue" />
        <StatsCard title="Beklemede" value={beklemede} icon="⏳" color="yellow" />
        <StatsCard title="İşlemde" value={islemde} icon="🔧" color="orange" />
        <StatsCard title="Çözüldü" value={cozuldu} icon="✅" color="green" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Son Şikayetler</h2>
        <ComplaintTable complaints={complaints.slice(0, 20)} />
      </div>
    </div>
  )
}
