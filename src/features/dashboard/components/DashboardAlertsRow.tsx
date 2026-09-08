// src/features/dashboard/components/DashboardAlertsRow.tsx
import type { AlertaVenta, AlertaCita, AlertaPedido, DashboardAlertas } from '../types'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'
import { DashboardAlertChip } from './DashboardAlertChip'

interface DashboardAlertsRowProps {
  alertas: DashboardAlertas
  ignoredVentas: number[]; ignoredCitas: number[]; ignoredPedidos: number[]
  onIgnoreVenta: (id: number) => void
  onIgnoreCita: (id: number) => void
  onIgnorePedido: (id: number) => void
}

export function DashboardAlertsRow({
  alertas, ignoredVentas, ignoredCitas, ignoredPedidos,
  onIgnoreVenta, onIgnoreCita, onIgnorePedido,
}: DashboardAlertsRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <DashboardAlertChip<AlertaVenta & { href: string }>
        items={alertas.ventas_sin_pago.map(v => ({ ...v, href: '/admin/sales' }))}
        label="pedidos sin venta registrada"
        baseHref="/admin/sales"
        ignoredIds={ignoredVentas}
        onIgnore={onIgnoreVenta}
        renderRow={v => ({ id: v.id_venta, primary: v.cliente_nombre, secondary: `${v.fecha?.slice(0,10)} · ${formatCurrency(v.total)}`, query: v.cliente_nombre })}
      />
      <DashboardAlertChip<AlertaCita & { href: string }>
        items={alertas.citas_sin_venta.map(c => ({ ...c, href: '/admin/appointments' }))}
        label="citas completadas sin pedido"
        baseHref="/admin/appointments"
        ignoredIds={ignoredCitas}
        onIgnore={onIgnoreCita}
        renderRow={c => ({ id: c.id_cita, primary: c.cliente_nombre, secondary: `${c.fecha?.slice(0,10)} · ${c.hora?.slice(0,5)}`, query: c.cliente_nombre })}
      />
      <DashboardAlertChip<AlertaPedido & { href: string }>
        items={alertas.pedidos_atrasados.map(p => ({ ...p, href: '/admin/orders' }))}
        label="pedidos pendientes hace +3 días"
        baseHref="/admin/orders"
        ignoredIds={ignoredPedidos}
        onIgnore={onIgnorePedido}
        renderRow={p => ({ id: p.id_detalle, primary: `${p.servicio} — ${p.cliente_nombre}`, secondary: p.fecha?.slice(0,10), query: p.cliente_nombre })}
      />
    </div>
  )
}
