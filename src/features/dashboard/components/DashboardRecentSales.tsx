// src/features/dashboard/components/DashboardRecentSales.tsx
import type { VentaReciente } from '../types'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'
import { Skeleton } from '@/src/shared/components/ui/skeleton'

interface DashboardRecentSalesProps { ventas: VentaReciente[]; isLoading: boolean }

export function DashboardRecentSales({ ventas, isLoading }: DashboardRecentSalesProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">Últimas ventas</h2>
      {isLoading ? (
        <div className="flex flex-col gap-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={`sk-${i}`} className="h-10 w-full" />)}</div>
      ) : (
        <ul className="flex flex-col gap-2">
          {ventas.map(v => (
            <li key={v.id_venta} className="flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-foreground truncate">{v.cliente_nombre}</span>
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums shrink-0 ml-2">
                {formatCurrency(v.total)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
