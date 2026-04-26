'use client'

import { useState, useEffect } from 'react'

interface LocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Tarayıcınız konum özelliğini desteklemiyor',
        loading: false,
      }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        })
      },
      (error) => {
        setLocation(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }))
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  return location
}
