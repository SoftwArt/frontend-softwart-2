// src/features/catalogos/hooks/useCatalogos.ts
import { useState, useEffect } from 'react'
import { apiRequest } from '@/src/shared/lib/apiClient'

export type EstadoCita     = { id_estado_cita: number;     nombre: string; estado: boolean }
export type EstadoServicio  = { id_estado: number; nombre: string; estado: boolean }
export type MetodoPago      = { id_metodo_pago: number;    nombre: string; estado: boolean }
export type EstadoPago      = { id_estado_pago: number;    nombre: string; estado: boolean }

type ApiResponse<T> = { success: boolean; data: T | { data: T; meta?: unknown } }

// PostgreSQL devuelve numeric/boolean a veces como string — normalizamos agresivamente
function toBoolean(val: unknown): boolean {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string')  return val === 'true' || val === '1' || val === 't'
  if (typeof val === 'number')  return val !== 0
  return true // si no viene el campo asumimos activo
}

function extractData<T>(res: ApiResponse<T>): T {
  if (res.data && typeof res.data === 'object' && 'data' in (res.data as object)) {
    return (res.data as { data: T }).data
  }
  return res.data as T
}

export function useCatalogos() {
  const [estadosCita,     setEstadosCita]     = useState<EstadoCita[]>([])
  const [estadosServicio, setEstadosServicio] = useState<EstadoServicio[]>([])
  const [metodosPago,     setMetodosPago]     = useState<MetodoPago[]>([])
  const [estadosPago,     setEstadosPago]     = useState<EstadoPago[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    setIsLoading(true); setError(null)
    try {
      const [ec, es, mp, ep] = await Promise.all([
        apiRequest<ApiResponse<EstadoCita[]>>('/api/estado-cita'),
        apiRequest<ApiResponse<EstadoServicio[]>>('/api/estado-servicio'),
        apiRequest<ApiResponse<MetodoPago[]>>('/api/metodo-pago'),
        apiRequest<ApiResponse<EstadoPago[]>>('/api/estado-pago'),
      ])
      setEstadosCita((extractData(ec) ?? []).map(e => ({ ...e, estado: toBoolean(e.estado) })))
      setEstadosServicio((extractData(es) ?? []).map(e => ({ ...e, estado: toBoolean(e.estado) })))
      setMetodosPago((extractData(mp) ?? []).map(m => ({ ...m, estado: toBoolean(m.estado) })))
      setEstadosPago((extractData(ep) ?? []).map(e => ({ ...e, estado: toBoolean(e.estado) })))
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  // Toggle via PUT (más compatible que PATCH /estado que puede no existir en catálogos)
  // recibe nombre + estadoActual para poder construir el body completo
  const makeToggle = (
    setter: React.Dispatch<React.SetStateAction<{ id: number; nombre: string; estado: boolean }[]>>,
    idKey: string,
    endpoint: string
  ) => async (id: number, nombre: string, currentEstado: boolean) => {
    const newEstado = !currentEstado
    // Optimistic update
    setter(prev => prev.map(item => (item as unknown as Record<string, unknown>)[idKey] === id ? { ...item, estado: newEstado } : item) as unknown as { id: number; nombre: string; estado: boolean }[])
    try {
      await apiRequest(`/api/${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nombre, estado: newEstado }),
      })
    } catch (e) {
      console.error(`[toggle ${endpoint}/${id}]`, e)
      // Rollback
      setter(prev => prev.map(item => (item as unknown as Record<string, unknown>)[idKey] === id ? { ...item, estado: currentEstado } : item) as unknown as { id: number; nombre: string; estado: boolean }[])
    }
  }

  const makeCrear = (endpoint: string) => async (data: { nombre: string }) => {
    await apiRequest(`/api/${endpoint}`, { method: 'POST', body: JSON.stringify({ ...data, estado: true }) })
    await fetchAll()
  }

  const makeEditar = (endpoint: string) => async (id: number, data: { nombre: string }) => {
    await apiRequest(`/api/${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    await fetchAll()
  }

  const makeEliminar = (endpoint: string) => async (id: number): Promise<string | null> => {
    try {
      await apiRequest(`/api/${endpoint}/${id}`, { method: 'DELETE' })
      await fetchAll(); return null
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      return msg.includes('500') || msg.includes('409') || msg.toLowerCase().includes('foreign') || msg.toLowerCase().includes('constraint')
        ? 'No se puede eliminar: hay registros relacionados que usan este valor.'
        : (msg || 'Error al eliminar')
    }
  }

  return {
    estadosCita, estadosServicio, metodosPago, estadosPago, isLoading, error,
    toggleEstadoCita:     makeToggle(setEstadosCita     as never, 'id_estado_cita',     'estado-cita'),
    toggleEstadoServicio: makeToggle(setEstadosServicio as never, 'id_estado_servicio', 'estado-servicio'),
    toggleMetodoPago:     makeToggle(setMetodosPago     as never, 'id_metodo_pago',     'metodo-pago'),
    toggleEstadoPago:     makeToggle(setEstadosPago     as never, 'id_estado_pago',     'estado-pago'),
    crearEstadoCita:     makeCrear('estado-cita'),
    crearEstadoServicio: makeCrear('estado-servicio'),
    crearMetodoPago:     makeCrear('metodo-pago'),
    crearEstadoPago:     makeCrear('estado-pago'),
    editarEstadoCita:     makeEditar('estado-cita'),
    editarEstadoServicio: makeEditar('estado-servicio'),
    editarMetodoPago:     makeEditar('metodo-pago'),
    editarEstadoPago:     makeEditar('estado-pago'),
    eliminarEstadoCita:     makeEliminar('estado-cita'),
    eliminarEstadoServicio: makeEliminar('estado-servicio'),
    eliminarMetodoPago:     makeEliminar('metodo-pago'),
    eliminarEstadoPago:     makeEliminar('estado-pago'),
  }
}