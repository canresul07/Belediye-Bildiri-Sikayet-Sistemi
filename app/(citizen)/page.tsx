import { createClient } from '@/lib/supabase/server'
import ComplaintCard from '@/components/complaint/ComplaintCard'
import MapWrapper from '@/components/map/MapWrapper'
import { MapPin, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: complaints } = await supabase
    .from('complaints')
    .select('*, profiles!complaints_user_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  const allComplaints = complaints || []

  // İstatistikler
  const totalCount = allComplaints.length
  const pendingCount = allComplaints.filter(c => c.status === 'beklemede').length
  const resolvedCount = allComplaints.filter(c => c.status === 'cozuldu').length
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-3 py-6">
        <h1 className="text-3xl sm:text-4xl font-bold">
          <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-green-600 bg-clip-text text-transparent">
            Antalya Şikayet Haritası
          </span>
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Şehrimizdeki sorunları birlikte çözelim. Haritada sorunları görüntüleyin, 
          yeni sorunlar bildirin.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
          <p className="text-xs text-gray-500">Toplam Bildirim</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
          <p className="text-xs text-gray-500">Bekleyen</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">%{resolutionRate}</p>
          <p className="text-xs text-gray-500">Çözüm Oranı</p>
        </div>
      </div>

      {/* Harita */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">📍 Canlı Harita</h2>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-400 rounded-full inline-block" /> Beklemede
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded-full inline-block" /> İnceleniyor
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full inline-block" /> Çözüldü
            </span>
          </div>
        </div>
        <MapWrapper complaints={allComplaints} />
      </div>

      {/* Son Şikayetler */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🕐 Son Bildirimler</h2>
        {allComplaints.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-lg">Henüz bildirim yok</p>
            <p className="text-gray-300 text-sm mt-1">İlk şikayeti siz bildirin!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allComplaints.slice(0, 12).map(complaint => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
