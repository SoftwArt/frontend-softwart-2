// src/features/users/components/UserViewDialog.tsx
import type { Usuario } from '../types'
import { getRolLabel, getRolBadgeClass } from '../utils'
import type { RolOption } from '@/src/shared/hooks/useOptions'
import { Badge } from '@/src/shared/components/ui/badge'
import { ViewDialog, EstadoBadge } from '@/src/shared/components/ViewDialog'

interface UserViewDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void
  usuario: Usuario
  rawRoles: RolOption[]
}

export function UserViewDialog({ open, onOpenChange, usuario, rawRoles }: UserViewDialogProps) {
  return (
    <ViewDialog open={open} onOpenChange={onOpenChange}
      title={`Usuario #${usuario.id_usuario}`}
      fields={[
        { label: 'Estado', value: <EstadoBadge estado={usuario.estado} /> },
        { label: 'Correo', value: usuario.correo, fullWidth: true },
        { label: 'Rol',    value: <Badge variant="outline" className={getRolBadgeClass(rawRoles, usuario.id_rol)}>{getRolLabel(rawRoles, usuario.id_rol)}</Badge> },
      ]} />
  )
}
