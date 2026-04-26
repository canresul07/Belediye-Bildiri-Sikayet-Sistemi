export type UserRole = 'vatandas' | 'belediye_yetkilisi' | 'super_admin'

export type ComplaintCategory =
  | 'cukur'
  | 'aydinlatma'
  | 'temizlik'
  | 'trafik_isareti'
  | 'kaldırim'
  | 'park_bahce'
  | 'su_kanal'
  | 'diger'

export type ComplaintStatus =
  | 'beklemede'
  | 'inceleniyor'
  | 'islemde'
  | 'cozuldu'
  | 'reddedildi'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  role: UserRole
  district: string | null
  created_at: string
  updated_at: string
}

export interface Complaint {
  id: string
  user_id: string | null
  category: ComplaintCategory
  title: string
  description: string | null
  photo_urls: string[]
  latitude: number
  longitude: number
  address_text: string | null
  district: string | null
  status: ComplaintStatus
  view_count: number
  upvote_count: number
  created_at: string
  updated_at: string
  resolved_at: string | null
  profiles?: Profile
}

export interface StatusHistory {
  id: string
  complaint_id: string
  changed_by: string | null
  old_status: ComplaintStatus | null
  new_status: ComplaintStatus
  note: string | null
  created_at: string
  profiles?: Profile
}

export interface ComplaintFilters {
  status?: ComplaintStatus
  category?: ComplaintCategory
  district?: string
  dateFrom?: string
  dateTo?: string
}
