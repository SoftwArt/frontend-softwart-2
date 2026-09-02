// src/features/sales/components/SaleViewDialog.tsx
import type { Venta } from '../types'
import { DOCUMENT_TYPES } from '@/src/features/clients/utils'
import type { ComboboxOption } from '@/src/shared/components/Combobox'
import type { ClienteOption } from '@/src/shared/hooks/useOptions'
import { ViewDialog, EstadoBadge } from '@/src/shared/components/ViewDialog'
import { formatDate } from '@/src/shared/lib/formatDate'
import { formatCurrency } from '@/src/shared/lib/formatCurrency'

interface SaleViewDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  venta: Venta
  clientesOpts: ComboboxOption[]; citasOpts: ComboboxOption[]; rawClientes: ClienteOption[]
}

export function SaleViewDialog({ open, onOpenChange, venta, clientesOpts, citasOpts, rawClientes }: SaleViewDialogProps) {
  const cliente = rawClientes.find(c => c.id_cliente === venta.id_cliente)
  return (
    <ViewDialog open={open} onOpenChange={onOpenChange}
      title={`Venta #${venta.id_venta}`}
      fields={[
        { label: 'Estado', value: <EstadoBadge estado={venta.estado} /> },
        { label: 'Cliente', value: clientesOpts.find(o => o.value === String(venta.id_cliente))?.label ?? `#${venta.id_cliente}`, fullWidth: true },
        { label: 'Tipo de documento', value: DOCUMENT_TYPES.find(t => t.value === cliente?.tipoDocumento)?.label ?? cliente?.tipoDocumento },
        { label: 'Documento',         value: cliente?.documento },
        { label: 'Cita',   value: venta.id_cita ? (citasOpts.find(o => o.value === String(venta.id_cita))?.label ?? `#${venta.id_cita}`) : '—' },
        { label: 'Fecha',  value: formatDate(venta.fecha) },
        { label: 'Total',  value: formatCurrency(venta.total) },
        { label: 'Observación', value: venta.observacion ?? '—', fullWidth: true },
      ]} />
  )
}
