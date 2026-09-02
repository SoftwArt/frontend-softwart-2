// src/features/services/components/ServiceViewDialog.tsx
import type { Servicio } from '../types'
import { fmtDuracion } from '../utils'
import { ViewDialog, EstadoBadge } from '@/src/shared/components/ViewDialog'

interface ServiceViewDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  servicio: Servicio
}

export function ServiceViewDialog({ open, onOpenChange, servicio }: ServiceViewDialogProps) {
  return (
    <ViewDialog open={open} onOpenChange={onOpenChange}
      title={`Servicio — ${servicio.nombre}`}
      fields={[
        { label: 'Estado',      value: <EstadoBadge estado={servicio.estado} /> },
        { label: 'Nombre',      value: servicio.nombre,       fullWidth: true },
        { label: 'Duración',    value: fmtDuracion(servicio.duracion) },
        { label: 'Descripción', value: servicio.descripcion,  fullWidth: true },
      ]} />
  )
}
