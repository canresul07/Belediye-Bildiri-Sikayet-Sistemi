import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: complaint } = await supabase
    .from('complaints')
    .select('*, profiles!complaints_user_id_fkey(full_name)')
    .eq('id', id)
    .single()

  if (!complaint) {
    return NextResponse.json({ error: 'Şikayet bulunamadı' }, { status: 404 })
  }

  const { data: history } = await supabase
    .from('status_history')
    .select('*, profiles!status_history_changed_by_fkey(full_name)')
    .eq('complaint_id', id)
    .order('created_at', { ascending: true })

  // Görüntülenme sayısını artır
  await supabase
    .from('complaints')
    .update({ view_count: (complaint.view_count || 0) + 1 })
    .eq('id', id)

  return NextResponse.json({ complaint, history })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('complaints')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
