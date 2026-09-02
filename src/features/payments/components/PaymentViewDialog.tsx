// src/features/payments/components/PaymentViewDialog.tsx
import type { Pago, MetodoPago, EstadoPago } from '../types'
import { metodoLabel, estadoLabel } from '../utils'
import type { ComboboxOption } from '@/src/shared/components/Combobox'
import { ViewDialog } from '@/src/shared/components/ViewDialog'
import { formatDate } from '@/src/shared/lib/formatDate'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'

interface PaymentViewDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  pago: Pago
  ventasOpts: ComboboxOption[]
  metodosPago: MetodoPago[]; estadosPago: EstadoPago[]
}

export function PaymentViewDialog({ open, onOpenChange, pago, ventasOpts, metodosPago, estadosPago }: PaymentViewDialogProps) {
  return (
    <ViewDialog open={open} onOpenChange={onOpenChange}
      title={`Pago #${pago.id_pago}`}
      fields={[
        { label: 'Venta',          value: ventasOpts.find(o => o.value === String(pago.id_venta))?.label ?? `#${pago.id_venta}`, fullWidth: true },
        { label: 'Monto',          value: formatCurrency(pago.monto) },
        { label: 'Fecha',          value: formatDate(pago.fecha) },
        { label: 'Método de pago', value: metodoLabel(metodosPago, pago.id_metodo_pago) },
        { label: 'Estado',         value: estadoLabel(estadosPago, pago.id_estado_pago) },
      ]} />
  )
}
