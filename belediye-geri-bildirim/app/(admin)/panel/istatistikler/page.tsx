'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import StatsCard from '@/components/admin/StatsCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Complaint } from '@/types'

export default function StatsPage() {
  const supabase = createClient()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('complaints')
        .select('*')
      setComplaints(data || [])
      setLoading(false)
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const total = complaints.length
  const beklemede = complaints.filter(c => c.status === 'beklemede').length
  const inceleniyor = complaints.filter(c => c.status === 'inceleniyor').length
  const islemde = complaints.filter(c => c.status === 'islemde').length
  const cozuldu = complaints.filter(c => c.status === 'cozuldu').length
  const reddedildi = complaints.filter(c => c.status === 'reddedildi').length

  // Kategori bazlı
  const categories: Record<string, number> = {}
  complaints.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1
  })

  // İlçe bazlı
  const districts: Record<string, number> = {}
  complaints.forEach(c => {
    if (c.district) {
      districts[c.district] = (districts[c.district] || 0) + 1
    }
  })

  // Çözüm süresi (ortalama gün)
  const resolved = complaints.filter(c => c.resolved_at)
  const avgResolutionDays = resolved.length > 0
    ? Math.round(
        resolved.reduce((sum, c) => {
          const created = new Date(c.created_at).getTime()
          const resolvedAt = new Date(c.resolved_at!).getTime()
          return sum + (resolvedAt - created) / (1000 * 60 * 60 * 24)
        }, 0) / resolved.length
      )
    : 0

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">📊 İstatistikler</h1>
        <p className="text-gray-500 text-sm mt-1">Detaylı şikayet analizleri</p>
      </div>

      {/* Durum İstatistikleri */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Durum Dağılımı</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard title="Beklemede" value={beklemede} icon="⏳" color="yellow" />
          <StatsCard title="İnceleniyor" value={inceleniyor} icon="🔍" color="blue" />
          <StatsCard title="İşlemde" value={islemde} icon="🔧" color="orange" />
          <StatsCard title="Çözüldü" value={cozuldu} icon="✅" color="green" />
          <StatsCard title="Reddedildi" value={reddedildi} icon="❌" color="red" />
        </div>
      </div>

      {/* Genel Metrikler */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Genel Metrikler</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-3xl font-bold text-gray-800">{total}</p>
            <p className="text-sm text-gray-500">Toplam Şikayet</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-3xl font-bold text-green-600">
              %{total > 0 ? Math.round((cozuldu / total) * 100) : 0}
            </p>
            <p className="text-sm text-gray-500">Çözüm Oranı</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-3xl font-bold text-blue-600">{avgResolutionDays}</p>
            <p className="text-sm text-gray-500">Ort. Çözüm Süresi (gün)</p>
          </div>
        </div>
      </div>

      {/* Kategori Dağılımı */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Kategori Dağılımı</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="space-y-3">
            {Object.entries(categories)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-sm w-32 truncate">{CATEGORY_LABELS[cat] || cat}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-8 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* İlçe Dağılımı */}
      {Object.keys(districts).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">İlçe Dağılımı</h2>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="space-y-3">
              {Object.entries(districts)
                .sort(([, a], [, b]) => b - a)
                .map(([dist, count]) => (
                  <div key={dist} className="flex items-center gap-3">
                    <span className="text-sm w-32 truncate capitalize">{dist}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-8 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
