import type { Venta, VentaDetalle } from '../types'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'

export const inputCls  = 'w-full bg-muted border-0 border-b-2 border-transparent focus:border-secondary focus:ring-0 focus:outline-none px-4 py-3 rounded-t-lg transition-all text-sm'
export const labelCls  = 'block text-xs font-bold capitalize tracking-widest text-muted-foreground mb-2'
export const selectCls = 'w-full bg-muted border-0 border-b-2 border-transparent data-[state=open]:border-secondary !h-auto rounded-t-lg px-4 py-3 text-sm shadow-none focus-visible:ring-0 focus-visible:border-secondary'

export function filterVentas(
  ventas: Venta[],
  clientesOpts: { value: string; label: string }[],
  citasOpts:    { value: string; label: string }[],
  q:            string,
  filterEstado: string,
): Venta[] {
  const s = q.toLowerCase()
  return ventas.filter(v => {
    const clienteLabel = clientesOpts.find(o => o.value === String(v.id_cliente))?.label ?? ''
    const citaLabel    = v.id_cita ? (citasOpts.find(o => o.value === String(v.id_cita))?.label ?? '') : ''
    const matchQ       = !s ||
      clienteLabel.toLowerCase().includes(s) ||
      citaLabel.toLowerCase().includes(s) ||
      v.fecha.includes(s)
    const matchEstado  = !filterEstado || (filterEstado === 'activo' ? v.estado : !v.estado)
    return matchQ && matchEstado
  })
}

// ── Cascadas (anular / eliminar) ─────────────────────────────
export const MSG_ANULAR_BASE = 'Esta acción es definitiva y no se puede reactivar.'

export function hasValidatedPayments(sale: VentaDetalle): boolean {
  return (sale.payments ?? []).some(p => p.paymentStatus?.nombre?.toLowerCase().includes('validado'))
}

export function buildEliminarLines(sale: VentaDetalle): string[] {
  return [
    ...(sale.saleDetails ?? []).map(d => `Servicio #${d.id_detalle} se eliminará`),
    ...(sale.payments ?? []).map(p => `Abono #${p.id_pago} (${formatCurrency(p.monto)}) se eliminará`),
  ]
}

export function buildAnularLines(sale: VentaDetalle): string[] {
  const serviciosACancelar = (sale.saleDetails ?? [])
    .filter(d => {
      const n = d.serviceStatus?.nombre?.toLowerCase() ?? ''
      return !n.includes('finaliz') && !n.includes('cancel')
    })
    .map(d => d.id_detalle)
  const abonosAAnular = (sale.payments ?? [])
    .filter(p => p.paymentStatus?.nombre?.toLowerCase().includes('pendiente'))
  return [
    ...serviciosACancelar.map(id_ => `Servicio #${id_} se cancelará`),
    ...abonosAAnular.map(p => `Abono #${p.id_pago} (${formatCurrency(p.monto)}) se anulará`),
  ]
}
