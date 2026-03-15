// ============================================================
// src/features/payments/hooks/usePayments.ts
//
// BUGs corregidos:
// 1. onCambiarEstado: usaba PUT /api/pagos/:id — INCORRECTO.
//    Endpoint correcto: PATCH /api/estado-pago/pago/:id/estado
// 2. onCambiarMetodo: usaba PUT /api/pagos/:id — INCORRECTO.
//    Endpoint correcto: PATCH /api/metodo-pago/pago/:id/metodo
// 3. body en onCrear/onEditar sin JSON.stringify.
// ============================================================
import { useState, useEffect } from 'react'
import { apiRequest } from '@/src/shared/lib/apiClient'

type Pago = {
  id_pago: number
  fecha: string
  monto: number
  observacion?: string
  id_venta: number
  id_metodo_pago: number
  id_estado_pago: number
}
type MetodoPago = { id_metodo_pago: number; nombre: string }
type EstadoPago = { id_estado_pago: number; nombre: string }
type CreatePagoDto = Omit<Pago, 'id_pago'>
type UpdatePagoDto = Partial<CreatePagoDto>

type ApiResponse<T> = {
  success: boolean
  message?: string
  data: T
  meta?: unknown
}

type BackendPago = {
  id_pago: number
  fecha: string
  monto: number
  observacion?: string
  venta?:      { id_venta: number } | null
  metodoPago?: { id_metodo_pago: number } | null
  estadoPago?: { id_estado_pago: number } | null
}

export function usePayments() {
  const [pagos,       setPagos]       = useState<Pago[]>([])
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([])
  const [estadosPago, setEstadosPago] = useState<EstadoPago[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [p, m, e] = await Promise.all([
        apiRequest<ApiResponse<BackendPago[]>>('/api/pagos?limit=500'),
        apiRequest<ApiResponse<MetodoPago[]>>('/api/metodo-pago'),
        apiRequest<ApiResponse<EstadoPago[]>>('/api/estado-pago'),
      ])

      const normalized: Pago[] = (p.data ?? []).map((item) => ({
        id_pago:        item.id_pago,
        fecha:          item.fecha,
        monto:          item.monto,
        observacion:    item.observacion,
        id_venta:       item.venta?.id_venta       ?? 0,
        id_metodo_pago: item.metodoPago?.id_metodo_pago ?? 0,
        id_estado_pago: item.estadoPago?.id_estado_pago ?? 0,
      }))

      setPagos(normalized)
      setMetodosPago(m.data ?? [])
      setEstadosPago(e.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pagos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const onCrear = async (data: CreatePagoDto) => {
    await apiRequest('/api/pagos', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    await fetchAll()
  }

  const onEditar = async (id: number, data: UpdatePagoDto) => {
    await apiRequest(`/api/pagos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    await fetchAll()
  }

  const onEliminar = async (id: number) => {
    await apiRequest(`/api/pagos/${id}`, { method: 'DELETE' })
    await fetchAll()
  }

  // PATCH /api/estado-pago/pago/:id/estado  — endpoint específico del backend
  const onCambiarEstado = async (id: number, id_estado_pago: number) => {
    await apiRequest(`/api/estado-pago/pago/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ id_estado_pago }),
    })
    await fetchAll()
  }

  // PATCH /api/metodo-pago/pago/:id/metodo  — endpoint específico del backend
  const onCambiarMetodo = async (id: number, id_metodo_pago: number) => {
    await apiRequest(`/api/metodo-pago/pago/${id}/metodo`, {
      method: 'PATCH',
      body: JSON.stringify({ id_metodo_pago }),
    })
    await fetchAll()
  }

  return { pagos, metodosPago, estadosPago, isLoading, error, onCrear, onEditar, onEliminar, onCambiarEstado, onCambiarMetodo }
}