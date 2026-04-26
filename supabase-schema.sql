-- ======================================
-- BelediyeGeriBildirim — Veritabanı Şeması
-- Bu SQL'i Supabase SQL Editor'de sırasıyla çalıştırın
-- ======================================

-- 1. Enum Tipleri
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

CREATE TYPE complaint_status AS ENUM (
  'beklemede',
  'inceleniyor',
  'islemde',
  'cozuldu',
  'reddedildi'
);

CREATE TYPE user_role AS ENUM (
  'vatandas',
  'belediye_yetkilisi',
  'super_admin'
);

-- 2. Tablolar

-- Profil tablosu (Supabase auth.users ile ilişkili)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role DEFAULT 'vatandas',
  district TEXT,
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
  photo_urls TEXT[] DEFAULT '{}',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address_text TEXT,
  district TEXT,
  status complaint_status DEFAULT 'beklemede',
  view_count INT DEFAULT 0,
  upvote_count INT DEFAULT 0,
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
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Destekler
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
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. İndeksler
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_district ON complaints(district);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_status_history_complaint ON status_history(complaint_id);

-- 4. Trigger'lar

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

-- 5. Row Level Security (RLS)

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

-- 6. Storage Bucket (Supabase Dashboard > Storage > New Bucket)
-- Bucket adı: complaint-photos
-- Public: true

-- Storage politikaları
-- CREATE POLICY "Herkes fotoğraf okuyabilir"
-- ON storage.objects FOR SELECT USING (bucket_id = 'complaint-photos');
--
-- CREATE POLICY "Giris yapan kullanici foto yukleyebilir"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'complaint-photos'
--   AND auth.role() = 'authenticated'
-- );
