'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Complaint, ComplaintFilters } from '@/types'

export function useComplaints(initialFilters?: ComplaintFilters) {
  const supabase = createClient()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ComplaintFilters>(initialFilters || {})

  const fetchComplaints = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('complaints')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.district) query = query.eq('district', filters.district)
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo)

    query = query.limit(100)

    const { data } = await query
    setComplaints(data || [])
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    fetchComplaints()
  }, [fetchComplaints])

  return { complaints, loading, filters, setFilters, refetch: fetchComplaints }
}
