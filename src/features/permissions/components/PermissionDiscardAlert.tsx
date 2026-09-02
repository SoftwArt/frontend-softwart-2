// src/features/permissions/components/PermissionDiscardAlert.tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/src/shared/components/ui/alert-dialog'

interface PermissionDiscardAlertProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: () => void
}

export function PermissionDiscardAlert({ open, onOpenChange, onConfirm }: PermissionDiscardAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Descartar cambios sin guardar?</AlertDialogTitle>
          <AlertDialogDescription>
            Tienes permisos modificados sin guardar para el rol actual. Si cambias de rol ahora,
            esos cambios se perderán.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Seguir editando</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Descartar y cambiar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
