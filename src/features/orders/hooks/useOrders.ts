// src/features/orders/hooks/useOrders.ts
import { useState, useEffect } from 'react'
import { apiRequest } from '@/src/shared/lib/apiClient'
import type { Pedido, CreatePedidoDto, UpdatePedidoDto, BackendDetalle } from '../types'

type ApiResponse<T> = { success: boolean; message?: string; data: T; meta?: unknown }

export function useOrders() {
  const [pedidos,   setPedidos]   = useState<Pedido[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  const fetchAll = async () => {
    setIsLoading(true); setError(null)
    try {
      const res = await apiRequest<ApiResponse<BackendDetalle[]>>('/api/sale-details?limit=500')
      setPedidos((res.data ?? []).map(item => ({
        id_detalle:  item.id_detalle,
        fecha:       item.fecha,
        precio:      item.precio,
        observacion: item.observacion,
        estado:      item.estado,
        id_venta:    item.sale?.id_venta         ?? 0,
        id_servicio: item.service?.id_servicio   ?? 0,
        id_estado:   item.serviceStatus?.id_estado ?? 1,
        id_marco:    item.frame?.id_marco         ?? null,
      })))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const onCreate = async (data: CreatePedidoDto) => {
    await apiRequest('/api/sale-details', { method: 'POST', body: JSON.stringify(data) })
    await fetchAll()
  }

  const onEdit = async (id: number, data: UpdatePedidoDto) => {
    await apiRequest(`/api/sale-details/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    await fetchAll()
  }

  const onChangeStatus = async (id: number, id_estado: number) => {
    const anterior = pedidos.find(p => p.id_detalle === id)?.id_estado
    // Optimistic update
    setPedidos(prev => prev.map(p => p.id_detalle === id ? { ...p, id_estado } : p))
    try {
      // FIX: backend lee req.body.id_estado, no id_estado_servicio
      await apiRequest(`/api/service-status/detalle/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ id_estado }),
      })
    } catch (e) {
      // Rollback
      setPedidos(prev => prev.map(p => p.id_detalle === id ? { ...p, id_estado: anterior ?? id_estado } : p))
      throw e
    }
  }

  return { pedidos, isLoading, error, onCreate, onEdit, onChangeStatus }
}
