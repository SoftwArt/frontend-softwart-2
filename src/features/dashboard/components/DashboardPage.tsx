// src/features/dashboard/components/DashboardPage.tsx
import { useDashboard } from '../hooks/useDashboard'
import { todayLongEsCO } from '../utils'
import { DashboardErrorState } from './DashboardErrorState'
import { DashboardAlertsRow } from './DashboardAlertsRow'
import { DashboardKpiGrid } from './DashboardKpiGrid'
import { DashboardSalesChart } from './DashboardSalesChart'
import { DashboardTodayAppointments } from './DashboardTodayAppointments'
import { DashboardRecentSales } from './DashboardRecentSales'
import { DashboardDonutCard } from './DashboardDonutCard'

export function DashboardPage() {
  const {
    data, isLoading, error, refetch,
    ignoredVentas, ignoredCitas, ignoredPedidos,
    ignoreVenta, ignoreCita, ignorePedido,
    weeksFilter, setWeeksFilter, ventasFiltradas,
    ventasTrend, ventasDiff,
    totalPedidosActivos,
  } = useDashboard()

  if (error) return <DashboardErrorState error={error} onRetry={refetch} />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground capitalize">{todayLongEsCO()}</p>
        </div>
      </div>

      {data && (
        <DashboardAlertsRow
          alertas={data.alertas}
          ignoredVentas={ignoredVentas} ignoredCitas={ignoredCitas} ignoredPedidos={ignoredPedidos}
          onIgnoreVenta={ignoreVenta} onIgnoreCita={ignoreCita} onIgnorePedido={ignorePedido}
        />
      )}

      <DashboardKpiGrid
        isLoading={isLoading}
        kpis={data?.kpis ?? null}
        ventasTrend={ventasTrend}
        ventasDiff={ventasDiff}
        totalPedidosActivos={totalPedidosActivos}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardSalesChart
          data={ventasFiltradas}
          isLoading={isLoading}
          weeksFilter={weeksFilter}
          onWeeksFilterChange={setWeeksFilter}
        />
        <DashboardTodayAppointments
          citas={data?.citas_hoy ?? []}
          count={data?.kpis.citas_hoy ?? 0}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardRecentSales ventas={data?.ventas_recientes ?? []} isLoading={isLoading} />
        <DashboardDonutCard
          title="Pedidos por estado"
          data={(data?.pedidos_por_estado ?? []).map(p => ({ name: p.estado, total: Number(p.total) }))}
          isLoading={isLoading}
          tooltipLabel="Pedidos"
        />
        <DashboardDonutCard
          title="Métodos de pago"
          data={(data?.metodos_pago ?? []).map(m => ({ name: m.metodo, total: Number(m.total) }))}
          isLoading={isLoading}
          tooltipLabel="Ventas"
          emptyMessage="Sin ventas registradas"
        />
      </div>
    </div>
  )
}
