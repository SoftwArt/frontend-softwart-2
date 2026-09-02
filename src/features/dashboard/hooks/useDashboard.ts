// src/features/dashboard/hooks/useDashboard.ts
import { useState, useEffect, useMemo } from 'react'
import { apiRequest } from '@/src/shared/lib/apiClient'
import type { DashboardData } from '../types'
import { getIgnored, persistIgnored, salesTrend } from '../utils'

type ApiRes = { success: boolean; data: DashboardData }

export function useDashboard() {
  const [data,      setData]      = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  const fetchDashboard = async () => {
    setIsLoading(true); setError(null)
    try {
      const res = await apiRequest<ApiRes>('/api/dashboard')
      setData(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  // ── Alertas ignoradas (persistidas en localStorage) ──────────────────────
  const [ignoredVentas,  setIgnoredVentas]  = useState<number[]>(() => getIgnored('ign_ventas'))
  const [ignoredCitas,   setIgnoredCitas]   = useState<number[]>(() => getIgnored('ign_citas'))
  const [ignoredPedidos, setIgnoredPedidos] = useState<number[]>(() => getIgnored('ign_pedidos'))

  const ignoreVenta  = (id: number) => { const n = [...ignoredVentas,  id]; setIgnoredVentas(n);  persistIgnored('ign_ventas',  n) }
  const ignoreCita   = (id: number) => { const n = [...ignoredCitas,   id]; setIgnoredCitas(n);   persistIgnored('ign_citas',   n) }
  const ignorePedido = (id: number) => { const n = [...ignoredPedidos, id]; setIgnoredPedidos(n); persistIgnored('ign_pedidos', n) }

  // ── Filtro de semanas para la gráfica de ventas ───────────────────────────
  const [weeksFilter, setWeeksFilter] = useState(8)
  const ventasFiltradas = useMemo(() => {
    if (!data) return []
    return data.ventas_por_semana.slice(-weeksFilter)
  }, [data, weeksFilter])

  // ── Derivados de KPIs ──────────────────────────────────────────────────────
  const ventasMes    = data?.kpis.ventas_mes_actual ?? 0
  const ventasAntMes = data?.kpis.ventas_mes_anterior ?? 0
  const { trend: ventasTrend, label: ventasDiff } = salesTrend(ventasMes, ventasAntMes)

  const totalPedidosActivos = data
    ? data.pedidos_por_estado.reduce((a, b) => a + Number(b.total), 0)
    : 0

  return {
    data, isLoading, error, refetch: fetchDashboard,
    ignoredVentas, ignoredCitas, ignoredPedidos,
    ignoreVenta, ignoreCita, ignorePedido,
    weeksFilter, setWeeksFilter, ventasFiltradas,
    ventasTrend, ventasDiff,
    totalPedidosActivos,
  }
}
