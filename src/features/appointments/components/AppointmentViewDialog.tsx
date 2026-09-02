// src/features/appointments/components/AppointmentViewDialog.tsx
import type { Cita, EstadoCita } from '../types'
import { badgeClassByName, estadoLabel } from '../utils'
import { DOCUMENT_TYPES } from '@/src/features/clients/utils'
import type { ComboboxOption } from '@/src/shared/components/Combobox'
import type { ClienteOption } from '@/src/shared/hooks/useOptions'
import { Badge } from '@/src/shared/components/ui/badge'
import { ViewDialog } from '@/src/shared/components/ViewDialog'
import { formatDate, formatTime } from '@/src/shared/lib/formatDate'

interface AppointmentViewDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  cita: Cita
  estadosCita: EstadoCita[]
  clientesOpts: ComboboxOption[]
  rawClientes: ClienteOption[]
}

export function AppointmentViewDialog({ open, onOpenChange, cita, estadosCita, clientesOpts, rawClientes }: AppointmentViewDialogProps) {
  const cliente = rawClientes.find(c => c.id_cliente === cita.id_cliente)
  return (
    <ViewDialog
      open={open} onOpenChange={onOpenChange}
      title={`Cita #${cita.id_cita}`}
      fields={[
        { label: 'Estado',  value: <Badge variant="outline" className={badgeClassByName(estadoLabel(estadosCita, cita.id_estado_cita))}>{estadoLabel(estadosCita, cita.id_estado_cita)}</Badge> },
        { label: 'Cliente', value: clientesOpts.find(o => o.value === String(cita.id_cliente))?.label ?? `#${cita.id_cliente}`, fullWidth: true },
        { label: 'Tipo de documento', value: DOCUMENT_TYPES.find(t => t.value === cliente?.tipoDocumento)?.label ?? cliente?.tipoDocumento },
        { label: 'Documento',         value: cliente?.documento },
        { label: 'Fecha',   value: formatDate(cita.fecha) },
        { label: 'Hora',    value: formatTime(cita.hora) },
        ...(cita.motivoCancelacion
          ? [{ label: 'Motivo de cancelación', value: cita.motivoCancelacion, fullWidth: true }]
          : []),
      ]}
    />
  )
}
