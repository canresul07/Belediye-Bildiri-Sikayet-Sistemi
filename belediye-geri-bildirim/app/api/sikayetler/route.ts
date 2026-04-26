import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  let query = supabase
    .from('complaints')
    .select('*, profiles!complaints_user_id_fkey(full_name)')
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
