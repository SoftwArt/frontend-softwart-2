// src/features/clients/components/ClientViewDialog.tsx
import type { Cliente } from '../types'
import { ViewDialog, EstadoBadge } from '@/src/shared/components/ViewDialog'

interface ClientViewDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  cliente: Cliente
}

export function ClientViewDialog({ open, onOpenChange, cliente }: ClientViewDialogProps) {
  return (
    <ViewDialog
      open={open} onOpenChange={onOpenChange}
      title={`Cliente — ${cliente.nombre}`}
      fields={[
        { label: 'Estado',         value: <EstadoBadge estado={cliente.estado} /> },
        { label: 'Tipo documento', value: cliente.tipoDocumento },
        { label: 'Documento',      value: cliente.documento },
        { label: 'Nombre',         value: cliente.nombre, fullWidth: true },
        { label: 'Correo',         value: cliente.correo, fullWidth: true },
        { label: 'Teléfono',       value: cliente.telefono },
      ]}
    />
  )
}
