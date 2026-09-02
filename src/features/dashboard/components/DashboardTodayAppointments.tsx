// src/features/dashboard/components/DashboardTodayAppointments.tsx
import type { CitaHoy } from '../types'
import { Badge } from '@/src/shared/components/ui/badge'
import { Skeleton } from '@/src/shared/components/ui/skeleton'

interface DashboardTodayAppointmentsProps { citas: CitaHoy[]; count: number; isLoading: boolean }

export function DashboardTodayAppointments({ citas, count, isLoading }: DashboardTodayAppointmentsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">
        Citas hoy
        {!isLoading && <Badge variant="secondary" className="ml-2">{count}</Badge>}
      </h2>
      {isLoading ? (
        <div className="flex flex-col gap-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={`sk-${i}`} className="h-12 w-full" />)}</div>
      ) : citas.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Sin citas para hoy 🎉</p>
      ) : (
        <ul className="flex flex-col gap-2 overflow-y-auto max-h-[200px]">
          {citas.map(c => (
            <li key={c.id_cita} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{c.cliente_nombre}</span>
                <span className="text-xs text-muted-foreground">{c.hora}</span>
              </div>
              <Badge variant="outline" className="text-xs">{c.estado}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
