'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { complaintSchema, ComplaintFormData } from '@/lib/validations/complaint'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Send, ImagePlus, MapPin } from 'lucide-react'

const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">
        <MapPin className="w-6 h-6 mr-2" /> Harita yükleniyor...
      </div>
    ),
  }
)

const CATEGORIES = [
  { value: 'cukur', label: '🕳️ Çukur / Yol Hasarı' },
  { value: 'aydinlatma', label: '💡 Aydınlatma Arızası' },
  { value: 'temizlik', label: '🗑️ Temizlik Sorunu' },
  { value: 'trafik_isareti', label: '🚦 Trafik İşareti' },
  { value: 'kaldırim', label: '🚶 Kaldırım Sorunu' },
  { value: 'park_bahce', label: '🌳 Park / Bahçe' },
  { value: 'su_kanal', label: '💧 Su / Kanal' },
  { value: 'diger', label: '📋 Diğer' },
]

const DISTRICTS = [
  'Muratpaşa', 'Kepez', 'Konyaaltı', 'Döşemealtı', 'Aksu',
]

export default function ComplaintForm() {
  const router = useRouter()
  const supabase = createClient()
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema)
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3)
    setPhotos(files)
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviews(urls)
  }

  const uploadPhotos = async (complaintId: string): Promise<string[]> => {
    const urls: string[] = []
    for (const photo of photos) {
      const ext = photo.name.split('.').pop()
      const path = `complaints/${complaintId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('complaint-photos')
        .upload(path, photo)
      if (!error) {
        const { data } = supabase.storage
          .from('complaint-photos')
          .getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    return urls
  }

  const onSubmit = async (data: ComplaintFormData) => {
    if (!location) {
      toast.error('Lütfen haritada konum seçin')
      return
    }

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Şikayet bildirmek için giriş yapmalısınız')
      setUploading(false)
      return
    }

    // Şikayet ID'sini önceden oluştur (Resimleri yüklemek için gerekli)
    const complaintId = crypto.randomUUID()

    // Önce resimleri yükle
    let photoUrls: string[] = []
    if (photos.length > 0) {
      photoUrls = await uploadPhotos(complaintId)
    }

    // Sonra şikayeti resimlerle birlikte tek seferde ekle
    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        id: complaintId,
        ...data,
        user_id: user.id,
        photo_urls: photoUrls,
        latitude: location.lat,
        longitude: location.lng,
        status: 'beklemede',
      })
      .select()
      .single()

    if (error || !complaint) {
      toast.error('Şikayet gönderilemedi: ' + (error?.message || ''))
      setUploading(false)
      return
    }

    toast.success('Şikayetiniz başarıyla bildirildi! 🎉')
    router.push(`/sikayet/${complaint.id}`)
    setUploading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      {/* Kategori */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Sorun Kategorisi *</label>
        <Select onValueChange={val => setValue('category', val as ComplaintFormData['category'])}>
          <SelectTrigger id="complaint-category">
            <SelectValue placeholder="Kategori seçin..." />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* Başlık */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Başlık *</label>
        <Input
          placeholder="Örn: Merkez Mahallesi'nde derin çukur"
          {...register('title')}
          id="complaint-title"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Açıklama */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Açıklama</label>
        <Textarea
          placeholder="Sorunu detaylı anlatın..."
          rows={3}
          {...register('description')}
          id="complaint-description"
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* İlçe */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">İlçe</label>
        <Select onValueChange={val => setValue('district', val)}>
          <SelectTrigger id="complaint-district">
            <SelectValue placeholder="İlçe seçin..." />
          </SelectTrigger>
          <SelectContent>
            {DISTRICTS.map(d => (
              <SelectItem key={d} value={d.toLowerCase()}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Adres */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Adres (opsiyonel)</label>
        <Input
          placeholder="Sokak, mahalle, bina no..."
          {...register('address_text')}
          id="complaint-address"
        />
      </div>

      {/* Fotoğraf */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Fotoğraf (max 3)</label>
        <div className="flex items-center gap-3">
          <label
            htmlFor="photo-upload"
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <ImagePlus className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">Fotoğraf Seç</span>
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoChange}
          />
          {photos.length > 0 && (
            <span className="text-sm text-green-600 font-medium">
              ✓ {photos.length} fotoğraf seçildi
            </span>
          )}
        </div>
        {previews.length > 0 && (
          <div className="flex gap-2 mt-2">
            {previews.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Önizleme ${i + 1}`}
                className="w-20 h-20 object-cover rounded-lg border"
              />
            ))}
          </div>
        )}
      </div>

      {/* Konum */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Konum * <span className="text-gray-400 font-normal">(Haritada işaretleyin)</span>
        </label>
        <LocationPicker
          onLocationSelect={(lat, lng) => {
            setLocation({ lat, lng })
            setValue('latitude', lat)
            setValue('longitude', lng)
          }}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || uploading}
        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-md h-12 text-base"
        size="lg"
        id="complaint-submit"
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Gönderiliyor...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Şikayeti Gönder
          </span>
        )}
      </Button>
    </form>
  )
}
