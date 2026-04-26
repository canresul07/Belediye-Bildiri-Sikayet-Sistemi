import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StatusBadge from '@/components/complaint/StatusBadge'
import StatusTimeline from '@/components/complaint/StatusTimeline'
import DetailMapWrapper from '@/components/map/DetailMapWrapper'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Eye, ThumbsUp, User } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { tr } from 'date-fns/locale'

const CATEGORY_LABELS: Record<string, string> = {
  cukur: '🕳️ Çukur / Yol Hasarı',
  aydinlatma: '💡 Aydınlatma Arızası',
  temizlik: '🗑️ Temizlik Sorunu',
  trafik_isareti: '🚦 Trafik İşareti',
  kaldırim: '🚶 Kaldırım Sorunu',
  park_bahce: '🌳 Park / Bahçe',
  su_kanal: '💧 Su / Kanal',
  diger: '📋 Diğer',
}

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: complaint, error: complaintError } = await supabase
    .from('complaints')
    .select('*, profiles!complaints_user_id_fkey(full_name)')
    .eq('id', id)
    .single()

  if (complaintError || !complaint) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Şikayet Bulunamadı veya Yüklenemedi</h1>
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          <p>Lütfen sayfa yapısını kontrol edin. İstenen ID: {id}</p>
          {complaintError && <p className="mt-2 text-sm opacity-80">Hata: {complaintError.message}</p>}
        </div>
        <Link href="/" className="inline-block mt-6 text-blue-600 hover:underline">Ana Sayfaya Dön</Link>
      </div>
    )
  }

  const { data: history } = await supabase
    .from('status_history')
    .select('*, profiles!status_history_changed_by_fkey(full_name)')
    .eq('complaint_id', id)
    .order('created_at', { ascending: true })

  // Görüntülenmeyi artır
  await supabase
    .from('complaints')
    .update({ view_count: (complaint.view_count || 0) + 1 })
    .eq('id', id)

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Geri Buton */}
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Ana Sayfaya Dön
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <span className="text-sm text-gray-500">
              {CATEGORY_LABELS[complaint.category]}
            </span>
            <h1 className="text-2xl font-bold text-gray-800 mt-1">
              {complaint.title}
            </h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400 flex-wrap">
              {complaint.profiles?.full_name && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {complaint.profiles.full_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(complaint.created_at), 'd MMMM yyyy HH:mm', { locale: tr })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {complaint.view_count} görüntülenme
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                {complaint.upvote_count} destek
              </span>
            </div>
          </div>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Detaylar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Açıklama */}
          {complaint.description && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-2">📝 Açıklama</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{complaint.description}</p>
            </div>
          )}

          {/* Fotoğraflar */}
          {complaint.photo_urls && complaint.photo_urls.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-3">📸 Fotoğraflar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {complaint.photo_urls.map((url: string, i: number) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Şikayet fotoğrafı ${i + 1}`}
                    className="w-full rounded-lg border object-cover max-h-64"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Harita */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Konum
            </h2>
            {complaint.address_text && (
              <p className="text-sm text-gray-500 mb-3">{complaint.address_text}</p>
            )}
            <DetailMapWrapper complaint={complaint} />
          </div>
        </div>

        {/* Sağ: Durum Geçmişi */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <StatusTimeline history={history || []} />
          </div>

          {/* İlçe Bilgisi */}
          {complaint.district && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">İlçe:</span>{' '}
                {complaint.district}
              </p>
            </div>
          )}

          {/* Çözülme tarihi */}
          {complaint.resolved_at && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700 font-medium">
                ✅ Çözüldü:{' '}
                {format(new Date(complaint.resolved_at), 'd MMMM yyyy HH:mm', { locale: tr })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
