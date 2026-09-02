// src/features/roles/components/RoleViewDialog.tsx
import type { Rol } from '../types'
import { ViewDialog, EstadoBadge } from '@/src/shared/components/ViewDialog'

interface RoleViewDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  rol: Rol
}

export function RoleViewDialog({ open, onOpenChange, rol }: RoleViewDialogProps) {
  return (
    <ViewDialog open={open} onOpenChange={onOpenChange}
      title={`Rol — ${rol.nombre}`}
      fields={[
        { label: 'Estado',      value: <EstadoBadge estado={rol.estado} /> },
        { label: 'Nombre',      value: rol.nombre,      fullWidth: true },
        { label: 'Descripción', value: rol.descripcion, fullWidth: true },
      ]} />
  )
}
