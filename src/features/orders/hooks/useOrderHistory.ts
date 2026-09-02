// src/features/orders/hooks/useOrderHistory.ts
import { useState } from 'react'
import type { HistorialEstado } from '../types'
import { apiRequest } from '@/src/shared/lib/apiClient'

export function useOrderHistory() {
  const [historial, setHistorial] = useState<HistorialEstado[] | null>(null)

  const load = (idDetalle: number) => {
    setHistorial(null)
    apiRequest<{ success: boolean; data: HistorialEstado[] }>(`/api/sale-details/${idDetalle}/historial`)
      .then(res => setHistorial(res.data ?? []))
      .catch(() => setHistorial([]))
  }

  const reset = () => setHistorial(null)

  return { historial, load, reset }
}
