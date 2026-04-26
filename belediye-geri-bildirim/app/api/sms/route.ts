import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const STATUS_MESSAGES: Record<string, string> = {
  inceleniyor: 'Şikayetiniz incelemeye alındı.',
  islemde: 'Şikayetiniz için ekibimiz sahaya çıktı.',
  cozuldu: 'Şikayetiniz çözüme kavuşturuldu. Teşekkürler!',
  reddedildi: 'Şikayetiniz değerlendirme sonucunda reddedildi.',
}

async function sendNetgsmSMS(phone: string, message: string): Promise<boolean> {
  try {
    const formattedPhone = phone.replace(/\D/g, '').replace(/^0/, '90')

    const url = new URL('https://api.netgsm.com.tr/sms/send/get/')
    url.searchParams.set('usercode', process.env.NETGSM_USER_CODE || '')
    url.searchParams.set('password', process.env.NETGSM_PASSWORD || '')
    url.searchParams.set('gsmno', formattedPhone)
    url.searchParams.set('message', message)
    url.searchParams.set('msgheader', process.env.NETGSM_MSG_HEADER || 'BELEDIYE')

    const res = await fetch(url.toString())
    const text = await res.text()
    return text.startsWith('00') || text.startsWith('01')
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const { complaintId, newStatus } = await req.json()
    const supabase = await createClient()

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

    // SMS gönderimi sadece Netgsm credentials varsa
    let success = false
    if (process.env.NETGSM_USER_CODE && process.env.NETGSM_PASSWORD) {
      success = await sendNetgsmSMS(profile.phone, fullMessage)
    }

    // Log kaydet
    await supabase.from('sms_logs').insert({
      complaint_id: complaintId,
      phone: profile.phone,
      message: fullMessage,
      status: success ? 'sent' : 'failed',
      sent_at: success ? new Date().toISOString() : null,
    })

    return NextResponse.json({ ok: success })
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'SMS gönderilemedi' }, { status: 500 })
  }
}
