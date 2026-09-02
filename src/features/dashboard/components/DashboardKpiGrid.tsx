// src/features/dashboard/components/DashboardKpiGrid.tsx
import type { DashboardKpis } from '../types'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'
import { Skeleton } from '@/src/shared/components/ui/skeleton'
import {
  CalendarClock, ClipboardList, Clock, CreditCard,
  DollarSign, PackageSearch, ShoppingBag, Wallet,
} from 'lucide-react'
import { DashboardKpiCard } from './DashboardKpiCard'

interface DashboardKpiGridProps {
  isLoading: boolean
  kpis: DashboardKpis | null
  ventasTrend: 'up' | 'down' | 'flat'
  ventasDiff: string
  totalPedidosActivos: number
}

export function DashboardKpiGrid({ isLoading, kpis, ventasTrend, ventasDiff, totalPedidosActivos }: DashboardKpiGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {isLoading || !kpis ? (
        Array.from({ length: 7 }).map((_, i) => <Skeleton key={`sk-${i}`} className="h-28 rounded-xl" />)
      ) : (
        <>
          <DashboardKpiCard label="Ventas del mes"         value={formatCurrency(kpis.ventas_mes_actual)} icon={DollarSign}    trend={ventasTrend}  trendLabel={ventasDiff} color="primary" />
          <DashboardKpiCard label="Ingresos cobrados"      value={formatCurrency(kpis.ingresos_mes)}      icon={Wallet}        color="emerald" sub="Pagos confirmados este mes" />
          <DashboardKpiCard label="Pagos pendientes"       value={formatCurrency(kpis.pagos_pendientes)}  icon={CreditCard}    color="amber"   sub="Pendientes de cobro" />
          <DashboardKpiCard label="Citas hoy"              value={kpis.citas_hoy}                         icon={CalendarClock} color="emerald" sub="Programadas para hoy" />
          <DashboardKpiCard label="Citas pendientes"       value={kpis.citas_pendientes}                  icon={Clock}         color="amber"   sub="Por confirmar" />
          <DashboardKpiCard label="Pedidos sin empezar"    value={kpis.pedidos_sin_empezar}                icon={PackageSearch} color="rose"    sub="Sin iniciar aún" />
          <DashboardKpiCard label="Pedidos en preparación" value={kpis.pedidos_en_preparacion}             icon={ClipboardList} color="amber"   sub="En proceso ahora" />
          <DashboardKpiCard label="Total pedidos activos"  value={totalPedidosActivos}                     icon={ShoppingBag}   color="primary" sub="Todos los estados" />
        </>
      )}
    </div>
  )
}
