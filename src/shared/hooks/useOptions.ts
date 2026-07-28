// ============================================================
// src/shared/hooks/useOptions.ts
// Fetchers ligeros que devuelven ComboboxOption[] para los
// selects relacionales en Citas, Ventas, Pedidos y Pagos.
// ============================================================
import { useState, useEffect } from 'react'
import { apiRequest } from '@/src/shared/lib/apiClient'
import type { ComboboxOption } from '@/src/shared/components/Combobox'

type ApiResponse<T> = { success: boolean; data: T; meta?: unknown }

// ── Clientes ──────────────────────────────────────────────────
type ClienteOption = { id_cliente: number; nombre: string; tipoDocumento: string; documento: string }

export function useClientsOptions() {
  const [options,     setOptions]     = useState<ComboboxOption[]>([])
  const [rawClientes, setRawClientes] = useState<ClienteOption[]>([])
  const [isLoading,   setIsLoading]   = useState(true)

  useEffect(() => {
    apiRequest<ApiResponse<ClienteOption[]>>('/api/clients?limit=100')
      .then((res) => {
        const data = res.data ?? []
        setRawClientes(data)
        setOptions(
          data.map((c) => ({
            value:    String(c.id_cliente),
            label:    c.nombre,
            sublabel: c.documento,
          }))
        )
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return { options, rawClientes, isLoading }
}

// ── Ventas ────────────────────────────────────────────────────
type VentaPayment = { paymentStatus?: { nombre?: string } | null }
type VentaOption = { id_venta: number; fecha: string; total: number; num_abonos?: number; payments?: VentaPayment[]; client?: { id_cliente: number; nombre?: string } | null }

export function useSalesOptions() {
  const [options,    setOptions]    = useState<ComboboxOption[]>([])
  const [rawVentas,  setRawVentas]  = useState<VentaOption[]>([])
  const [isLoading,  setIsLoading]  = useState(true)

  useEffect(() => {
    apiRequest<ApiResponse<VentaOption[]>>('/api/sales?limit=100')
      .then((res) => {
        const data = res.data ?? []
        setRawVentas(data)
        setOptions(
          data.map((v) => ({
            value:    String(v.id_venta),
            label:    `Venta #${v.id_venta} — ${new Date(v.fecha).toLocaleDateString('es-CO')}`,
            sublabel: v.total?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }),
          }))
        )
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return { options, rawVentas, isLoading }
}

// ── Citas ─────────────────────────────────────────────────────
type CitaOption = { id_cita: number; fecha: string; hora: string; client?: { id_cliente: number } | null }

export function useAppointmentsOptions() {
  const [options,   setOptions]   = useState<ComboboxOption[]>([])
  const [rawCitas,  setRawCitas]  = useState<CitaOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiRequest<ApiResponse<CitaOption[]>>('/api/appointments?limit=100')
      .then((res) => {
        const data = res.data ?? []
        setRawCitas(data)
        setOptions(
          data.map((c) => ({
            value:    String(c.id_cita),
            label:    `Cita #${c.id_cita} — ${new Date(c.fecha).toLocaleDateString('es-CO')}`,
            sublabel: c.hora,
          }))
        )
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return { options, rawCitas, isLoading }
}

// ── Servicios ─────────────────────────────────────────────────
type ServicioOption = { id_servicio: number; nombre: string }

export function useServicesOptions() {
  const [options,   setOptions]   = useState<ComboboxOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiRequest<ApiResponse<ServicioOption[]>>('/api/services')
      .then((res) => {
        setOptions(
          (res.data ?? []).map((s) => ({
            value: String(s.id_servicio),
            label: s.nombre,
          }))
        )
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return { options, isLoading }
}

// ── Roles ─────────────────────────────────────────────────────
export type RolOption = { id_rol: number; nombre: string; estado: boolean }

export function useRolesOptions() {
  const [options,    setOptions]    = useState<ComboboxOption[]>([])
  const [rawRoles,   setRawRoles]   = useState<RolOption[]>([])
  const [isLoading,  setIsLoading]  = useState(true)

  useEffect(() => {
    apiRequest<ApiResponse<RolOption[]>>('/api/roles?limit=100')
      .then((res) => {
        const data = res.data ?? []
        setRawRoles(data)
        // Solo roles activos — no tendría sentido dejar crear un usuario
        // con un rol que el propio módulo de Roles marcó como inactivo.
        setOptions(
          data
            .filter((r) => r.estado)
            .map((r) => ({ value: String(r.id_rol), label: r.nombre }))
        )
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return { options, rawRoles, isLoading }
}

// ── Marcos ────────────────────────────────────────────────────
type MarcoOption = { id_marco: number; codigo: string; precio_ensamblado: number }

export function useFrameOptions() {
  const [options,   setOptions]   = useState<ComboboxOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiRequest<ApiResponse<MarcoOption[]>>('/api/frames')
      .then((res) => {
        setOptions(
          (res.data ?? []).map((m) => ({
            value:    String(m.id_marco),
            label:    m.codigo,
            sublabel: m.precio_ensamblado?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }),
          }))
        )
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return { options, isLoading }
}