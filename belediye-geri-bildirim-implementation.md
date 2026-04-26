# 🏛️ BelediyeGeriBildirim — Agent Implementation Guide

> Bu dosya Cursor, Windsurf veya herhangi bir AI destekli IDE içinde agent'lara
> adım adım okutulmak üzere hazırlanmıştır. Her bölüm bağımsız bir görev paketi
> olarak verilebilir.

---

## 📋 İçindekiler

1. [Proje Özeti](#1-proje-özeti)
2. [Teknoloji Stack](#2-teknoloji-stack)
3. [Klasör Yapısı](#3-klasör-yapısı)
4. [Veritabanı Şeması](#4-veritabanı-şeması)
5. [Kurulum Adımları](#5-kurulum-adımları)
6. [Supabase Konfigürasyonu](#6-supabase-konfigürasyonu)
7. [Authentication Modülü](#7-authentication-modülü)
8. [Şikayet Modülü](#8-şikayet-modülü)
9. [Harita Modülü](#9-harita-modülü)
10. [Belediye Admin Paneli](#10-belediye-admin-paneli)
11. [Bildirim Sistemi (SMS)](#11-bildirim-sistemi-sms)
12. [UI Bileşenleri](#12-ui-bileşenleri)
13. [API Route'ları](#13-api-routeları)
14. [Environment Variables](#14-environment-variables)
15. [Deploy](#15-deploy)
16. [Agent Görev Sırası](#16-agent-görev-sırası)

---

## 1. Proje Özeti

**BelediyeGeriBildirim**, Antalya'daki vatandaşların sokak sorunlarını (çukur,
arıza, temizlik, aydınlatma vb.) fotoğrafla bildirebildiği, takip edebildiği ve
belediyelerin bu şikayetleri yönettiği şeffaf bir platformdur.

### Temel Aktörler

| Aktör | Yetkiler |
|-------|----------|
| **Vatandaş** | Şikayet bildir, kendi şikayetlerini takip et, değerlendir |
| **Belediye Yetkilisi** | Tüm şikayetleri gör, durum güncelle, not ekle |
| **Süper Admin** | Belediye yetkilileri oluştur, istatistik görüntüle |

### Şikayet Yaşam Döngüsü

```
[Vatandaş bildirir] → beklemede
        ↓
[Belediye kabul eder] → inceleniyor
        ↓
[Ekip yönlendirilir] → işlemde
        ↓
[Sorun giderilir] → çözüldü
```

---

## 2. Teknoloji Stack

```
Frontend  : Next.js 14 (App Router)
Stil      : Tailwind CSS + shadcn/ui
Veritabanı: Supabase (PostgreSQL)
Auth      : Supabase Auth (telefon OTP veya e-posta)
Depolama  : Supabase Storage (fotoğraflar)
Harita    : Leaflet.js + react-leaflet
SMS       : Netgsm API
Deploy    : Vercel
```

### Paket Versiyonları

```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "^18.3.x",
    "react-dom": "^18.3.x",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "leaflet": "^1.9.x",
    "react-leaflet": "^4.x",
    "tailwindcss": "^3.4.x",
    "shadcn-ui": "latest",
    "lucide-react": "latest",
    "date-fns": "^3.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x"
  }
}
```

---

## 3. Klasör Yapısı

Agent'a söyle: "Aşağıdaki klasör yapısını tam olarak oluştur."

```
belediye-geri-bildirim/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (citizen)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  ← Ana sayfa (harita + son şikayetler)
│   │   ├── sikayet/
│   │   │   ├── yeni/
│   │   │   │   └── page.tsx          ← Şikayet formu
│   │   │   └── [id]/
│   │   │       └── page.tsx          ← Şikayet detay
│   │   └── profilim/
│   │       └── page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── panel/
│   │   │   └── page.tsx              ← Belediye dashboard
│   │   ├── panel/sikayetler/
│   │   │   └── page.tsx
│   │   └── panel/istatistikler/
│   │       └── page.tsx
│   ├── api/
│   │   ├── sikayetler/
│   │   │   ├── route.ts              ← GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts          ← GET, PATCH
│   │   ├── sms/
│   │   │   └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── map/
│   │   ├── ComplaintMap.tsx          ← Ana harita bileşeni
│   │   ├── ComplaintPin.tsx          ← Harita üzerindeki pin
│   │   └── LocationPicker.tsx        ← Şikayet formu için konum seçici
│   ├── complaint/
│   │   ├── ComplaintCard.tsx
│   │   ├── ComplaintForm.tsx
│   │   ├── StatusBadge.tsx
│   │   └── StatusTimeline.tsx
│   ├── admin/
│   │   ├── StatsCard.tsx
│   │   ├── ComplaintTable.tsx
│   │   └── StatusUpdater.tsx
│   └── ui/                           ← shadcn/ui bileşenleri buraya
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 ← Tarayıcı client
│   │   ├── server.ts                 ← Sunucu client (SSR)
│   │   └── middleware.ts
│   ├── validations/
│   │   └── complaint.ts              ← Zod şemaları
│   ├── hooks/
│   │   ├── useComplaints.ts
│   │   ├── useAuth.ts
│   │   └── useLocation.ts
│   └── utils.ts
├── types/
│   └── index.ts                      ← Tüm TypeScript tipleri
├── middleware.ts                     ← Auth koruması
├── .env.local
├── next.config.js
└── tailwind.config.ts
```

---

## 4. Veritabanı Şeması

Agent'a söyle: "Supabase SQL editöründe aşağıdaki SQL'leri sırasıyla çalıştır."

### 4.1 Enum Tipleri

```sql
-- Şikayet kategorileri
CREATE TYPE complaint_category AS ENUM (
  'cukur',
  'aydinlatma',
  'temizlik',
  'trafik_isareti',
  'kaldırim',
  'park_bahce',
  'su_kanal',
  'diger'
);

-- Şikayet durumları
CREATE TYPE complaint_status AS ENUM (
  'beklemede',
  'inceleniyor',
  'islemde',
  'cozuldu',
  'reddedildi'
);

-- Kullanıcı rolleri
CREATE TYPE user_role AS ENUM (
  'vatandas',
  'belediye_yetkilisi',
  'super_admin'
);
```

### 4.2 Tablolar

```sql
-- Profil tablosu (Supabase auth.users ile ilişkili)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role DEFAULT 'vatandas',
  district TEXT,                        -- İlçe: kepez, muratpasa, konyaalti...
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Şikayetler
CREATE TABLE complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category complaint_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  photo_urls TEXT[] DEFAULT '{}',       -- Birden fazla fotoğraf destekler
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address_text TEXT,                    -- Serbest metin adres
  district TEXT,                        -- İlçe
  status complaint_status DEFAULT 'beklemede',
  view_count INT DEFAULT 0,
  upvote_count INT DEFAULT 0,           -- Aynı sorunu destekleyenler
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Durum geçmişi (audit trail)
CREATE TABLE status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  old_status complaint_status,
  new_status complaint_status NOT NULL,
  note TEXT,                            -- Belediye notu
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Destekler (bir vatandaş aynı şikayeti destekleyebilir)
CREATE TABLE upvotes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, complaint_id)
);

-- SMS bildirim log'u
CREATE TABLE sms_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES complaints(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',        -- pending | sent | failed
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 İndeksler

```sql
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_district ON complaints(district);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_location ON complaints USING GIST (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);
CREATE INDEX idx_status_history_complaint ON status_history(complaint_id);
```

### 4.4 Trigger'lar

```sql
-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Şikayet çözüldüğünde resolved_at set et
CREATE OR REPLACE FUNCTION set_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cozuldu' AND OLD.status != 'cozuldu' THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaints_resolved_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION set_resolved_at();

-- Yeni kullanıcı kaydında profil oluştur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'İsimsiz'),
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 4.5 Row Level Security (RLS)

```sql
-- RLS aktif et
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Profiles politikaları
CREATE POLICY "Kullanici kendi profilini okuyabilir"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Kullanici kendi profilini guncelleyebilir"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Complaints politikaları
CREATE POLICY "Herkes sikayet okuyabilir"
  ON complaints FOR SELECT USING (true);

CREATE POLICY "Giris yapan kullanici sikayet olusturabilir"
  ON complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sadece belediye yetkilisi durumu degistirebilir"
  ON complaints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('belediye_yetkilisi', 'super_admin')
    )
  );

-- Status history politikaları
CREATE POLICY "Herkes durum gecmisini okuyabilir"
  ON status_history FOR SELECT USING (true);

CREATE POLICY "Sadece belediye yetkilisi gecmis ekleyebilir"
  ON status_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('belediye_yetkilisi', 'super_admin')
    )
  );

-- Upvotes politikaları
CREATE POLICY "Herkes upvote sayisini okuyabilir"
  ON upvotes FOR SELECT USING (true);

CREATE POLICY "Giris yapan kullanici upvote ekleyebilir"
  ON upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanici kendi upvotesini silebilir"
  ON upvotes FOR DELETE USING (auth.uid() = user_id);
```

---

## 5. Kurulum Adımları

Agent'a söyle: "Aşağıdaki komutları sırasıyla çalıştır."

```bash
# 1. Projeyi oluştur
npx create-next-app@latest belediye-geri-bildirim \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd belediye-geri-bildirim

# 2. Bağımlılıkları yükle
npm install @supabase/supabase-js @supabase/ssr
npm install leaflet react-leaflet
npm install @types/leaflet --save-dev
npm install react-hook-form zod @hookform/resolvers
npm install date-fns lucide-react clsx tailwind-merge
npm install sonner                          # Toast bildirimleri

# 3. shadcn/ui kur
npx shadcn-ui@latest init
# Prompt'larda: Default style, Slate renk paleti, CSS variables evet

# 4. Gerekli shadcn bileşenlerini ekle
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
```

---

## 6. Supabase Konfigürasyonu

### 6.1 Client (Tarayıcı)

`lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 6.2 Server (SSR / API Routes)

`lib/supabase/server.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### 6.3 Middleware

`middleware.ts` (proje kökünde)
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Admin panel koruması
  if (request.nextUrl.pathname.startsWith('/panel') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 7. Authentication Modülü

### 7.1 TypeScript Tipleri

`types/index.ts`
```typescript
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
```

### 7.2 Kayıt Sayfası

`app/(auth)/register/page.tsx`
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, phone: form.phone }
      }
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.')
      router.push('/login')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">🏛️ Kayıt Ol</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              placeholder="Ad Soyad"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="E-posta"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              placeholder="Telefon (05xx...)"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Şifre"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 7.3 Auth Hook

`lib/hooks/useAuth.ts`
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }

      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(data)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = () => supabase.auth.signOut()

  return { user, profile, loading, signOut }
}
```

---

## 8. Şikayet Modülü

### 8.1 Zod Validasyon Şeması

`lib/validations/complaint.ts`
```typescript
import { z } from 'zod'

export const complaintSchema = z.object({
  category: z.enum([
    'cukur', 'aydinlatma', 'temizlik',
    'trafik_isareti', 'kaldırim', 'park_bahce', 'su_kanal', 'diger'
  ]),
  title: z.string()
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),
  description: z.string()
    .max(500, 'Açıklama en fazla 500 karakter olabilir')
    .optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address_text: z.string().optional(),
  district: z.string().optional(),
})

export type ComplaintFormData = z.infer<typeof complaintSchema>
```

### 8.2 Şikayet Formu Bileşeni

`components/complaint/ComplaintForm.tsx`
```typescript
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
import LocationPicker from '@/components/map/LocationPicker'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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

export default function ComplaintForm() {
  const router = useRouter()
  const supabase = createClient()
  const [photos, setPhotos] = useState<File[]>([])
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

  const uploadPhotos = async (complaintId: string): Promise<string[]> => {
    const urls: string[] = []
    for (const photo of photos) {
      const ext = photo.name.split('.').pop()
      const path = `complaints/${complaintId}/${Date.now()}.${ext}`
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
      return
    }

    // Önce şikayeti oluştur
    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        ...data,
        user_id: user.id,
        latitude: location.lat,
        longitude: location.lng,
        status: 'beklemede',
      })
      .select()
      .single()

    if (error || !complaint) {
      toast.error('Şikayet gönderilemedi')
      setUploading(false)
      return
    }

    // Fotoğrafları yükle ve URL'leri güncelle
    if (photos.length > 0) {
      const photoUrls = await uploadPhotos(complaint.id)
      await supabase
        .from('complaints')
        .update({ photo_urls: photoUrls })
        .eq('id', complaint.id)
    }

    toast.success('Şikayetiniz başarıyla bildirildi!')
    router.push(`/sikayet/${complaint.id}`)
    setUploading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">🏛️ Sorun Bildir</h1>

      {/* Kategori */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Sorun Kategorisi *</label>
        <Select onValueChange={val => setValue('category', val as any)}>
          <SelectTrigger>
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
        <label className="text-sm font-medium">Başlık *</label>
        <Input
          placeholder="Örn: Merkez Mahallesi'nde derin çukur"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Açıklama */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Açıklama</label>
        <Textarea
          placeholder="Sorunu detaylı anlatın..."
          rows={3}
          {...register('description')}
        />
      </div>

      {/* Fotoğraf */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Fotoğraf (max 3)</label>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={e => {
            const files = Array.from(e.target.files || []).slice(0, 3)
            setPhotos(files)
          }}
        />
        {photos.length > 0 && (
          <p className="text-sm text-gray-500">{photos.length} fotoğraf seçildi</p>
        )}
      </div>

      {/* Konum */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Konum * (Haritada işaretleyin)</label>
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
        className="w-full"
        size="lg"
      >
        {uploading ? 'Gönderiliyor...' : '📤 Şikayeti Gönder'}
      </Button>
    </form>
  )
}
```

### 8.3 Şikayet Kart Bileşeni

`components/complaint/ComplaintCard.tsx`
```typescript
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { Complaint } from '@/types'
import StatusBadge from './StatusBadge'
import Link from 'next/link'

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
      <div className="bg-white rounded-lg border hover:shadow-md transition-shadow p-4 cursor-pointer">
        {complaint.photo_urls[0] && (
          <img
            src={complaint.photo_urls[0]}
            alt={complaint.title}
            className="w-full h-40 object-cover rounded-md mb-3"
          />
        )}

        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs text-gray-500">
              {CATEGORY_LABELS[complaint.category]}
            </span>
            <h3 className="font-semibold text-gray-800 mt-1">{complaint.title}</h3>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <div className="flex items-center gap-3 mt-3 text-sm text-gray-400">
          <span>📍 {complaint.district || 'Konum belirtilmedi'}</span>
          <span>•</span>
          <span>
            {formatDistanceToNow(new Date(complaint.created_at), {
              addSuffix: true,
              locale: tr,
            })}
          </span>
          <span>•</span>
          <span>👍 {complaint.upvote_count}</span>
        </div>
      </div>
    </Link>
  )
}
```

### 8.4 Durum Rozeti

`components/complaint/StatusBadge.tsx`
```typescript
import { Badge } from '@/components/ui/badge'
import type { ComplaintStatus } from '@/types'

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; variant: string; color: string }> = {
  beklemede:   { label: '⏳ Beklemede',  variant: 'outline', color: 'border-yellow-400 text-yellow-700 bg-yellow-50' },
  inceleniyor: { label: '🔍 İnceleniyor', variant: 'outline', color: 'border-blue-400 text-blue-700 bg-blue-50' },
  islemde:     { label: '🔧 İşlemde',    variant: 'outline', color: 'border-orange-400 text-orange-700 bg-orange-50' },
  cozuldu:     { label: '✅ Çözüldü',    variant: 'outline', color: 'border-green-400 text-green-700 bg-green-50' },
  reddedildi:  { label: '❌ Reddedildi', variant: 'outline', color: 'border-red-400 text-red-700 bg-red-50' },
}

export default function StatusBadge({ status }: { status: ComplaintStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}
```

---

## 9. Harita Modülü

> ⚠️ Leaflet SSR sorunları nedeniyle `dynamic import` ile yüklenmelidir.

### 9.1 Ana Harita Bileşeni

`components/map/ComplaintMap.tsx`
```typescript
'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Complaint } from '@/types'
import Link from 'next/link'
import StatusBadge from '@/components/complaint/StatusBadge'

// Leaflet default ikon fix
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

// Durum bazlı renkli ikonlar
const createStatusIcon = (status: string) => {
  const colors: Record<string, string> = {
    beklemede: '#EAB308',
    inceleniyor: '#3B82F6',
    islemde: '#F97316',
    cozuldu: '#22C55E',
    reddedildi: '#EF4444',
  }
  const color = colors[status] || '#6B7280'
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })
}

interface Props {
  complaints: Complaint[]
  center?: [number, number]
  zoom?: number
  height?: string
}

export default function ComplaintMap({
  complaints,
  center = [36.8841, 30.7056], // Antalya merkezi
  zoom = 13,
  height = '500px',
}: Props) {
  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints.map(complaint => (
          <Marker
            key={complaint.id}
            position={[complaint.latitude, complaint.longitude]}
            icon={createStatusIcon(complaint.status)}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-sm mb-1">{complaint.title}</p>
                <StatusBadge status={complaint.status} />
                <Link
                  href={`/sikayet/${complaint.id}`}
                  className="block mt-2 text-xs text-blue-600 hover:underline"
                >
                  Detayları gör →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
```

### 9.2 Sayfada Dinamik Import

`app/(citizen)/page.tsx`
```typescript
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'

// SSR olmadan yükle
const ComplaintMap = dynamic(
  () => import('@/components/map/ComplaintMap'),
  { ssr: false, loading: () => <div className="h-[500px] bg-gray-100 animate-pulse rounded-lg" /> }
)

export default async function HomePage() {
  const supabase = createClient()

  const { data: complaints } = await supabase
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🏛️ Antalya Şikayet Haritası</h1>
        <p className="text-gray-500 mt-1">Şehrimizdeki sorunları birlikte çözelim</p>
      </div>

      <ComplaintMap complaints={complaints || []} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(complaints || []).map(complaint => (
          <div key={complaint.id}>
            {/* ComplaintCard burada render edilir */}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 9.3 Konum Seçici

`components/map/LocationPicker.tsx`
```typescript
'use client'

import { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface Props {
  onLocationSelect: (lat: number, lng: number) => void
}

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null)

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setPosition([lat, lng])
      onSelect(lat, lng)
    }
  })

  return position ? (
    <Marker position={position} icon={L.Icon.Default.prototype} />
  ) : null
}

export default function LocationPicker({ onLocationSelect }: Props) {
  const [selected, setSelected] = useState(false)

  const handleSelect = useCallback((lat: number, lng: number) => {
    onLocationSelect(lat, lng)
    setSelected(true)
  }, [onLocationSelect])

  return (
    <div>
      <div className="h-[300px] rounded-lg overflow-hidden border">
        <MapContainer
          center={[36.8841, 30.7056]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={handleSelect} />
        </MapContainer>
      </div>
      {selected
        ? <p className="text-sm text-green-600 mt-1">✅ Konum seçildi</p>
        : <p className="text-sm text-gray-400 mt-1">Haritada sorunun konumuna tıklayın</p>
      }
    </div>
  )
}
```

---

## 10. Belediye Admin Paneli

### 10.1 Dashboard Sayfası

`app/(admin)/panel/page.tsx`
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StatsCard from '@/components/admin/StatsCard'

export default async function AdminDashboard() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['belediye_yetkilisi', 'super_admin'].includes(profile.role)) {
    redirect('/')
  }

  // İstatistikler
  const [
    { count: total },
    { count: beklemede },
    { count: islemde },
    { count: cozuldu },
  ] = await Promise.all([
    supabase.from('complaints').select('*', { count: 'exact', head: true }),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'beklemede'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'islemde'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'cozuldu'),
  ])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📊 Belediye Paneli</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Toplam Şikayet" value={total || 0} icon="📋" color="blue" />
        <StatsCard title="Beklemede" value={beklemede || 0} icon="⏳" color="yellow" />
        <StatsCard title="İşlemde" value={islemde || 0} icon="🔧" color="orange" />
        <StatsCard title="Çözüldü" value={cozuldu || 0} icon="✅" color="green" />
      </div>
    </div>
  )
}
```

### 10.2 Durum Güncelleme Bileşeni

`components/admin/StatusUpdater.tsx`
```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { ComplaintStatus } from '@/types'

const STATUSES: { value: ComplaintStatus; label: string }[] = [
  { value: 'beklemede', label: '⏳ Beklemede' },
  { value: 'inceleniyor', label: '🔍 İnceleniyor' },
  { value: 'islemde', label: '🔧 İşlemde' },
  { value: 'cozuldu', label: '✅ Çözüldü' },
  { value: 'reddedildi', label: '❌ Reddedildi' },
]

interface Props {
  complaintId: string
  currentStatus: ComplaintStatus
  onUpdated: () => void
}

export default function StatusUpdater({ complaintId, currentStatus, onUpdated }: Props) {
  const supabase = createClient()
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(currentStatus)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (newStatus === currentStatus) {
      toast.error('Durum değiştirilmedi')
      return
    }

    setLoading(true)

    // Şikayeti güncelle
    const { error: updateError } = await supabase
      .from('complaints')
      .update({ status: newStatus })
      .eq('id', complaintId)

    if (updateError) {
      toast.error('Güncelleme başarısız')
      setLoading(false)
      return
    }

    // Durum geçmişi ekle
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('status_history').insert({
      complaint_id: complaintId,
      changed_by: user?.id,
      old_status: currentStatus,
      new_status: newStatus,
      note: note || null,
    })

    // SMS bildirim tetikle
    await fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaintId, newStatus }),
    })

    toast.success('Durum güncellendi')
    setNote('')
    onUpdated()
    setLoading(false)
  }

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium text-sm">Durumu Güncelle</h3>
      <Select
        value={newStatus}
        onValueChange={val => setNewStatus(val as ComplaintStatus)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map(s => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Vatandaşa not (isteğe bağlı)..."
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={2}
      />
      <Button onClick={handleUpdate} disabled={loading} className="w-full">
        {loading ? 'Güncelleniyor...' : 'Durumu Güncelle'}
      </Button>
    </div>
  )
}
```

---

## 11. Bildirim Sistemi (SMS)

### 11.1 Netgsm SMS API Route

`app/api/sms/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const STATUS_MESSAGES: Record<string, string> = {
  inceleniyor: 'Şikayetiniz incelemeye alındı.',
  islemde: 'Şikayetiniz için ekibimiz sahaya çıktı.',
  cozuldu: 'Şikayetiniz çözüme kavuşturuldu. Teşekkürler!',
  reddedildi: 'Şikayetiniz değerlendirme sonucunda reddedildi.',
}

async function sendNetgsmSMS(phone: string, message: string) {
  const formattedPhone = phone.replace(/\D/g, '').replace(/^0/, '90')

  const response = await fetch('https://api.netgsm.com.tr/sms/send/get/', {
    method: 'GET',
    headers: {},
  })

  // Netgsm GET API URL formatı
  const url = new URL('https://api.netgsm.com.tr/sms/send/get/')
  url.searchParams.set('usercode', process.env.NETGSM_USER_CODE!)
  url.searchParams.set('password', process.env.NETGSM_PASSWORD!)
  url.searchParams.set('gsmno', formattedPhone)
  url.searchParams.set('message', message)
  url.searchParams.set('msgheader', process.env.NETGSM_MSG_HEADER || 'BELEDIYE')

  const res = await fetch(url.toString())
  const text = await res.text()
  return text.startsWith('00') || text.startsWith('01')
}

export async function POST(req: NextRequest) {
  const { complaintId, newStatus } = await req.json()
  const supabase = createClient()

  const message = STATUS_MESSAGES[newStatus]
  if (!message) return NextResponse.json({ ok: true })

  // Şikayet sahibinin telefonunu al
  const { data: complaint } = await supabase
    .from('complaints')
    .select('user_id, title')
    .eq('id', complaintId)
    .single()

  if (!complaint?.user_id) return NextResponse.json({ ok: true })

  const { data: profile } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', complaint.user_id)
    .single()

  if (!profile?.phone) return NextResponse.json({ ok: true })

  const fullMessage = `BelediyeGeriBildirim: "${complaint.title}" başlıklı şikayetinizin durumu güncellendi. ${message}`

  const success = await sendNetgsmSMS(profile.phone, fullMessage)

  // Log kaydet
  await supabase.from('sms_logs').insert({
    complaint_id: complaintId,
    phone: profile.phone,
    message: fullMessage,
    status: success ? 'sent' : 'failed',
    sent_at: success ? new Date().toISOString() : null,
  })

  return NextResponse.json({ ok: success })
}
```

---

## 12. UI Bileşenleri

### 12.1 İstatistik Kartı

`components/admin/StatsCard.tsx`
```typescript
interface Props {
  title: string
  value: number
  icon: string
  color: 'blue' | 'yellow' | 'orange' | 'green' | 'red'
}

const COLOR_MAP = {
  blue:   'bg-blue-50 text-blue-700 border-blue-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  green:  'bg-green-50 text-green-700 border-green-200',
  red:    'bg-red-50 text-red-700 border-red-200',
}

export default function StatsCard({ title, value, icon, color }: Props) {
  return (
    <div className={`rounded-xl border p-4 ${COLOR_MAP[color]}`}>
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value.toLocaleString('tr-TR')}</div>
      <div className="text-sm font-medium opacity-80">{title}</div>
    </div>
  )
}
```

### 12.2 Durum Zaman Çizelgesi

`components/complaint/StatusTimeline.tsx`
```typescript
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { StatusHistory } from '@/types'

const STATUS_ICONS: Record<string, string> = {
  beklemede: '⏳',
  inceleniyor: '🔍',
  islemde: '🔧',
  cozuldu: '✅',
  reddedildi: '❌',
}

interface Props {
  history: StatusHistory[]
}

export default function StatusTimeline({ history }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700">📅 Durum Geçmişi</h3>
      <div className="relative pl-6 border-l-2 border-gray-200 space-y-4">
        {history.map((entry, i) => (
          <div key={entry.id} className="relative">
            <div className="absolute -left-[25px] w-5 h-5 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-xs">
              {STATUS_ICONS[entry.new_status] || '•'}
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm capitalize">
                  {entry.new_status.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(entry.created_at), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </span>
              </div>
              {entry.note && (
                <p className="text-sm text-gray-600 mt-1">{entry.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 13. API Route'ları

### 13.1 Şikayetler GET & POST

`app/api/sikayetler/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(req.url)

  let query = supabase
    .from('complaints')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })

  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const district = searchParams.get('district')
  const limit = parseInt(searchParams.get('limit') || '20')

  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)
  if (district) query = query.eq('district', district)
  query = query.limit(limit)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
```

### 13.2 Tek Şikayet GET & PATCH

`app/api/sikayetler/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: complaint } = await supabase
    .from('complaints')
    .select('*, profiles(full_name)')
    .eq('id', params.id)
    .single()

  const { data: history } = await supabase
    .from('status_history')
    .select('*, profiles(full_name)')
    .eq('complaint_id', params.id)
    .order('created_at', { ascending: true })

  // Görüntülenme sayısını artır
  await supabase
    .from('complaints')
    .update({ view_count: (complaint?.view_count || 0) + 1 })
    .eq('id', params.id)

  return NextResponse.json({ complaint, history })
}
```

---

## 14. Environment Variables

`.env.local` dosyasını oluştur ve şu değerleri doldur:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   # Sadece server-side

# Netgsm SMS
NETGSM_USER_CODE=85xxxxxx
NETGSM_PASSWORD=xxxxxxxx
NETGSM_MSG_HEADER=BELEDIYE              # Onaylı başlık (5-11 karakter)

# Uygulama
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAP_CENTER_LAT=36.8841
NEXT_PUBLIC_MAP_CENTER_LNG=30.7056
```

---

## 15. Deploy

### 15.1 Vercel Deploy

```bash
# Vercel CLI kur
npm install -g vercel

# Deploy et
vercel

# Production deploy
vercel --prod
```

### 15.2 Vercel Dashboard'dan Environment Variables

Vercel → Project Settings → Environment Variables bölümüne `.env.local` içindeki tüm değişkenleri ekle.

### 15.3 Supabase Storage Bucket

```sql
-- Supabase Dashboard > Storage > New Bucket
-- Bucket adı: complaint-photos
-- Public: true (fotoğraflar herkese açık)

-- Storage politikası
CREATE POLICY "Herkes fotoğraf okuyabilir"
ON storage.objects FOR SELECT USING (bucket_id = 'complaint-photos');

CREATE POLICY "Giris yapan kullanici foto yukleyebilir"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'complaint-photos'
  AND auth.role() = 'authenticated'
);
```

### 15.4 Leaflet Static Dosyaları

Leaflet marker ikonları için `/public/leaflet/` klasörüne şu dosyaları koy:
- `marker-icon.png`
- `marker-icon-2x.png`
- `marker-shadow.png`

Bu dosyalar `node_modules/leaflet/dist/images/` içinde bulunur.

```bash
mkdir -p public/leaflet
cp node_modules/leaflet/dist/images/marker-icon.png public/leaflet/
cp node_modules/leaflet/dist/images/marker-icon-2x.png public/leaflet/
cp node_modules/leaflet/dist/images/marker-shadow.png public/leaflet/
```

---

## 16. Agent Görev Sırası

Bu bölümü Cursor veya Windsurf agent'ına aşamalı olarak ver.

### 🟢 Görev 1 — Proje İskeleti
```
Next.js 14 projesi oluştur, tüm bağımlılıkları yükle,
klasör yapısını oluştur, .env.local dosyasını hazırla.
Sadece iskelet — içerik yok.
```

### 🟢 Görev 2 — Supabase & Veritabanı
```
Supabase client/server dosyalarını oluştur.
types/index.ts dosyasındaki tüm tipleri ekle.
```

### 🟢 Görev 3 — Authentication
```
Kayıt ve giriş sayfalarını oluştur.
useAuth hook'unu yaz.
Middleware ile /panel rotasını koru.
```

### 🟢 Görev 4 — Şikayet Formu
```
ComplaintForm bileşenini yaz.
Zod validasyonu ekle.
Fotoğraf yükleme ve Supabase Storage entegrasyonunu tamamla.
```

### 🟢 Görev 5 — Harita
```
ComplaintMap bileşenini yaz (dynamic import ile).
LocationPicker'ı şikayet formuna entegre et.
Durum bazlı renkli pinleri ekle.
```

### 🟢 Görev 6 — Ana Sayfa
```
Harita + son şikayetler listesini birleştir.
Filtreleme (kategori, durum, ilçe) ekle.
Mobil uyumlu responsive düzen.
```

### 🟢 Görev 7 — Admin Panel
```
Belediye dashboard'unu oluştur.
StatusUpdater bileşeniyle durum güncelleme yap.
İstatistik kartlarını ve şikayet tablosunu ekle.
```

### 🟢 Görev 8 — SMS Bildirimi
```
/api/sms route'unu Netgsm entegrasyonuyla yaz.
Status değişiminde otomatik SMS tetikle.
SMS loglarını veritabanına kaydet.
```

### 🟢 Görev 9 — Test & Deploy
```
Tüm sayfaları manuel test et.
Leaflet static dosyalarını public klasörüne kopyala.
Vercel'e deploy et, environment variables ekle.
```

---

## 📌 Notlar

- Tüm Türkçe metinler UTF-8 ile kaydedilmeli
- Supabase RLS her zaman aktif tutulmalı — güvenlik kritik
- Harita her zaman `dynamic import` ile yüklenmeli (SSR hatası önlenir)
- SMS Netgsm panelinden onaylı başlık alınmalı (BELEDIYE gibi)
- İlk pilot için sadece 1 ilçe belediyesiyle başla (Kepez veya Muratpaşa)

---

*Hazırlayan: AI Implementation Guide — BelediyeGeriBildirim v1.0*
