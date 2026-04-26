'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Complaint } from '@/types'
import ComplaintCard from '@/components/complaint/ComplaintCard'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export default function ProfilePage() {
  const { user, profile, loading } = useAuth()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loadingComplaints, setLoadingComplaints] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      const fetchComplaints = async () => {
        const { data } = await supabase
          .from('complaints')
          .select('*, profiles!complaints_user_id_fkey(full_name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setComplaints(data || [])
        setLoadingComplaints(false)
      }
      fetchComplaints()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Profil Kartı */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 h-24" />
        <div className="p-6 -mt-12">
          <div className="w-20 h-20 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {profile?.full_name || 'Kullanıcı'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
            {user?.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {user.email}
              </span>
            )}
            {profile?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                {profile.phone}
              </span>
            )}
            {profile?.district && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {profile.district}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {profile?.created_at && format(new Date(profile.created_at), 'd MMMM yyyy', { locale: tr })}
            </span>
          </div>
        </div>
      </div>

      {/* Şikayetlerim */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Şikayetlerim ({complaints.length})
        </h2>

        {loadingComplaints ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Henüz şikayet bildiriminiz yok</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map(complaint => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
