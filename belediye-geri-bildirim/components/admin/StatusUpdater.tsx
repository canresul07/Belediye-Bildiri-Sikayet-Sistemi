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
import { RefreshCw } from 'lucide-react'

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

    const { error: updateError } = await supabase
      .from('complaints')
      .update({ status: newStatus })
      .eq('id', complaintId)

    if (updateError) {
      toast.error('Güncelleme başarısız: ' + updateError.message)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('status_history').insert({
      complaint_id: complaintId,
      changed_by: user?.id,
      old_status: currentStatus,
      new_status: newStatus,
      note: note || null,
    })

    // SMS bildirim tetikle
    try {
      await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintId, newStatus }),
      })
    } catch {
      // SMS hatası ana işlem akışını durdurmasın
    }

    toast.success('Durum güncellendi ✓')
    setNote('')
    onUpdated()
    setLoading(false)
  }

  return (
    <div className="space-y-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border">
      <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Durumu Güncelle
      </h3>
      <Select
        value={newStatus}
        onValueChange={val => setNewStatus(val as ComplaintStatus)}
      >
        <SelectTrigger id="status-select">
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
        id="status-note"
      />
      <Button
        onClick={handleUpdate}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
        id="status-update-btn"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Güncelleniyor...
          </span>
        ) : 'Durumu Güncelle'}
      </Button>
    </div>
  )
}
