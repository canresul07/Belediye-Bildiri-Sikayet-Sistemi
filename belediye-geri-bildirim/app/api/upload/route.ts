import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const formData = await req.formData()
    const file = formData.get('file') as File
    const complaintId = formData.get('complaintId') as string

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const path = `complaints/${complaintId || 'temp'}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('complaint-photos')
      .upload(path, file)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabase.storage
      .from('complaint-photos')
      .getPublicUrl(path)

    return NextResponse.json({ url: data.publicUrl })
  } catch (error) {
    return NextResponse.json({ error: 'Yükleme başarısız' }, { status: 500 })
  }
}
